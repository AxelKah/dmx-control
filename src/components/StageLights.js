import React, { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GridContainer from "./GridContainer";
import LightModal from "./LightModal";
import SetupLights from "./SetupLights";
import Light from "../models/Light";
import {
  updateSelectedLights,
  makeApiCall,
  addMultipleLights,
  makeCycleApiCall,
} from "../utils/utils";
import GPTColorForm from "./GPTColorForm";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import SceneList from "./SceneList";
import LightSetupSelector from "./SetupSelector";
import { useLightData } from "../contexts/lightsContext";
import { saveScenes, getScenes, deleteScene } from "../api/dmxApi";

const StageLights = () => {
  const [lights, setLights] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [numLights, setNumLights] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [selectedScene, setSelectedScene] = useState(null);
  const [showSceneDropdown, setShowSceneDropdown] = useState(false);
  const [isCycleRunning, setIsCycleRunning] = useState(false);
  const selectedLights = lights.filter((light) => light.selected);
  const { selectedLightSetup } = useLightData();
  const dropdownToggleRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [masterBrightness, setMasterBrightness] = useState(100);
  const [isMasterBrightnessEnabled, setIsMasterBrightnessEnabled] =
    useState(false);
  const [originalIntensity, setOriginalIntensity] = useState([]);

  useEffect(() => {
    // to close select scene modal if user clicks outside of it
    const handleClickOutside = (event) => {
      if (
        dropdownToggleRef.current &&
        !dropdownToggleRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!selectedLightSetup) return;

    const fetchSetupsScenes = async () => {
      try {
        const fetchedScenes = await getScenes(selectedLightSetup);
        const scenesArray =
          fetchedScenes && fetchedScenes.scenes ? fetchedScenes.scenes : [];
        setScenes(scenesArray);
      } catch (error) {
        console.error("Error fetching scenes:", error);
      }
    };

    setSelectedScene(null);
    fetchSetupsScenes();
  }, [selectedLightSetup]);

  const toggleMasterBrightness = async (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      const original = lights.map((light) => ({
        id: light.id,
        intensity: light.intensity,
      }));
      setOriginalIntensity(original);
    } else {
      const restoredLights = lights.map((light) => {
        const original = originalIntensity.find((orig) => orig.id === light.id);
        return {
          ...light,
          intensity: original ? original.intensity : light.intensity,
        };
      });

      setLights(restoredLights);
      setOriginalIntensity([]);

      try {
        await handleApplyChanges(
          "http://localhost:5000/set-brightness",
          restoredLights
        );
      } catch (error) {
        console.error("Error restoring brightness on backend:", error);
      }
    }

    setIsMasterBrightnessEnabled(isChecked);
  };

  const handleMasterBrightnessChange = async (e) => {
    const brightness = parseInt(e.target.value, 10);
    setMasterBrightness(brightness);

    if (isMasterBrightnessEnabled) {
      const adjustedLights = lights.map((light) => {
        const scaledIntensity = brightness;

        return {
          ...light,
          intensity: scaledIntensity,
        };
      });

      setLights(adjustedLights);

      try {
        await handleApplyChanges(
          "http://localhost:5000/set-brightness",
          adjustedLights
        );
      } catch (error) {
        console.error("Error applying brightness changes to backend:", error);
      }
    }
  };

  const addLight = (channel, startAddress) => {
    console.log("Adding light");
    const id = parseInt(numLights + 1);
    const newLight = new Light(id, channel, startAddress);
    setLights([...lights, newLight]);
    setNumLights(parseInt(numLights + 1));
  };

  const handleDrop = (item, newContainerId) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === item.id ? { ...light, containerId: newContainerId } : light
      )
    );
  };

  const updateLight = (id, updates) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, ...updates } : light
      )
    );
  };

  const containerLights = (containerId) =>
    lights.filter((light) => light && light.containerId === containerId);

  const handleClick = (clickedLight) => {
    setLights(
      lights.map((light) =>
        light.id === clickedLight.id
          ? {
              ...light,
              selected: !light.selected,
            }
          : light
      )
    );
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.selected ? { ...light, color: e.target.value } : light
      )
    );
  };

  const handleIntensityChange = (e) => {
    const intensity = parseInt(e.target.value);
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.selected ? { ...light, intensity } : light
      )
    );
  };

  const handleApplyChanges = async (url, updatedLights = lights) => {
    // use the provided lights array (updatedLights)
    if (!updatedLights || updatedLights.length === 0) {
      console.warn("No lights provided to update.");
      return;
    }

    try {
      // console.log("Sending lights to backend:", updatedLights);
      await makeApiCall(url, updatedLights);
    } catch (error) {
      console.error("Error applying changes:", error);
    }
  };

  const resetLights = async () => {
    const resetColor = "#ffffff";
    const resetIntensity = 100;

    const resetLightsArray = lights.map((light) => ({
      ...light,
      color: resetColor,
      intensity: resetIntensity,
    }));

    setLights(resetLightsArray);
    setSelectedScene(null);

    await handleSceneChanges(
      "http://localhost:5000/set-lights",
      resetLightsArray
    );
  };

  const handleSceneChanges = async (url, sceneLights) => {
    console.log("sceneLights: ", sceneLights);
    await makeApiCall(url, sceneLights);
  };

  const handleFinishSetup = (values) => {
    console.log("Finished! Collected values:", values);
    addLightsFromSetup(values);
  };

  const addLightsFromSetup = (values) => {
    const { left, back, right, front } = values.sides;

    let currentId = numLights;

    // Add lights to each container
    const { newLights: leftLights, currentId: leftId } = addMultipleLights(
      left,
      "container1",
      currentId
    );
    currentId = leftId;
    const { newLights: backLights, currentId: backId } = addMultipleLights(
      back,
      "container2",
      currentId
    );
    currentId = backId;
    const { newLights: rightLights, currentId: rightId } = addMultipleLights(
      right,
      "container3",
      currentId
    );
    currentId = rightId;
    const { newLights: frontLights, currentId: frontId } = addMultipleLights(
      front,
      "container4",
      currentId
    );
    currentId = frontId;

    setLights((prevLights) => [
      ...prevLights,
      ...leftLights,
      ...backLights,
      ...rightLights,
      ...frontLights,
    ]);
    setNumLights(currentId); // Update the number of lights
  };

  const logCurrentLights = () => {
    lights.forEach((light) => {
      console.log(`Light ID: ${light.id}, Color: ${light.color}`);
    });
    console.log(scenes);
  };

  const [cycleInterval, setCycleInterval] = useState(null);

  const startSceneCycle = async (selectedScenes, interval) => {
    if (cycleInterval) {
      clearInterval(cycleInterval);
    }

    if (!Array.isArray(selectedScenes) || selectedScenes.length !== 2) {
      alert("Please select exactly two scenes.");
      return;
    }

    const [scene1, scene2] = selectedScenes;

    if (!Array.isArray(scene1.colors) || !Array.isArray(scene2.colors)) {
      console.error(
        "One or both selected scenes are missing 'colors': ",
        scene1,
        scene2
      );
      alert("Selected scenes must have light configurations.");
      return;
    }

    try {
      // apply master brightness if enabled
      const adjustBrightness = (colors) =>
        colors.map((color) => ({
          ...color,
          intensity: isMasterBrightnessEnabled
            ? masterBrightness
            : color.intensity,
        }));

      const transformLights = (colors) =>
        colors.map((light) => ({
          id: light.lightId,
          color: light.color,
          channel: light.channel,
          startAddress: light.startAddress,
          intensity: light.intensity,
        }));

      const sceneLightsArrays = [
        transformLights(adjustBrightness(scene1.colors)),
        transformLights(adjustBrightness(scene2.colors)),
      ];

      setIsCycleRunning(true);

      await makeCycleApiCall(
        "http://localhost:5000/set-cycle",
        sceneLightsArrays,
        interval
      );

      let currentIndex = 0;

      const updateLightsState = () => {
        const currentSceneLights = sceneLightsArrays[currentIndex];
        const currentScene = selectedScenes[currentIndex];

        if (currentSceneLights) {
          const updatedLights = lights.map((existingLight) => {
            const matchingColor = currentSceneLights.find(
              (color) => color.id === existingLight.id
            );

            if (matchingColor) {
              return {
                ...existingLight,
                color: matchingColor.color,
                intensity: matchingColor.intensity, // adjusted above if needed
                selected: false,
              };
            }

            return {
              ...existingLight,
              selected: false,
            };
          });

          setLights(updatedLights);
          setSelectedScene(currentScene);
        }

        currentIndex = (currentIndex + 1) % sceneLightsArrays.length;
      };

      if (cycleInterval) clearInterval(cycleInterval);

      // Update lights immediately for the first scene
      updateLightsState();

      const intervalId = setInterval(updateLightsState, interval);
      setCycleInterval(intervalId);
    } catch (error) {
      console.error("Failed to start scene cycle:", error);
      alert("Failed to start scene cycle. Please try again.");
      setIsCycleRunning(false);
    }
  };

  const stopSceneCycle = async () => {
    // stop frontend updates
    if (cycleInterval) {
      clearInterval(cycleInterval);
      setCycleInterval(null);
    }

    // stop backend updates
    try {
      await makeApiCall("http://localhost:5000/stop-cycle", {});
    } catch (error) {
      console.error("Failed to stop scene cycle:", error);
    } finally {
      setIsCycleRunning(false);
    }
  };

  const saveCurrentScene = () => {
    const sceneName = prompt("Enter scene name");

    if (!sceneName || sceneName.trim() === "") {
      alert("Scene name cannot be empty. Please enter a valid name.");
      return;
    }

    const scene = {
      name: sceneName,
      lightSetupId: selectedLightSetup,
      colors: lights.map((light) => ({
        lightId: light.id,
        color: light.color,
        channel: light.channel,
        intensity: light.intensity,
        startAddress: light.startAddress,
      })),
    };
    setScenes([...scenes, scene]);
    saveScenes(scene);
  };

  const deleteCurrentScene = (sceneId) => {
    // console.log("Deleting scene with ID: ", sceneId);

    if (!sceneId) {
      alert("No scene selected to delete. Please select a scene first.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this scene?"
    );

    if (!confirmDelete) {
      // clicked "Cancel"
      return;
    }

    // update local state to remove scene from the list
    setScenes((prevScenes) => {
      const updatedScenes = prevScenes.filter((scene) => scene.id !== sceneId);

      // reset selectedScene
      if (selectedScene && selectedScene.id === sceneId) {
        setSelectedScene(null);
      }

      return updatedScenes;
    });

    deleteScene(sceneId);
  };

  const handleItemClick = (item) => {
    // updated array of lights with the changes
    const updatedLights = lights.map((light) => {
      const matchingColor = item.colors.find(
        (color) => color.lightId === light.id
      );
      if (matchingColor) {
        return {
          ...light,
          color: matchingColor.color,
          intensity: matchingColor.intensity,
        };
      }
      return light;
    });

    setLights(updatedLights);
    setSelectedScene(item);
    handleSceneChanges("http://localhost:5000/set-scene", updatedLights);
  };

  return (
    <div>
      <div className="master-brightness-container flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-lg m-6 w-32 justify-between absolute top-1/3 left-1 md:left-36 transform -translate-y-1/2">
        {/* Master Brightness Toggle */}
        <div className="flex flex-col items-center mb-20">
          <input
            type="checkbox"
            id="masterBrightnessToggle"
            checked={isMasterBrightnessEnabled}
            onChange={toggleMasterBrightness}
            className="form-checkbox h-5 w-5 text-green-500 focus:ring-2 focus:ring-green-300"
            disabled={isCycleRunning}
          />
          <label
            htmlFor="masterBrightnessToggle"
            className="font-semibold text-gray-700 text-center mt-2 text-sm"
          >
            MASTER BRIGHTNESS
          </label>
        </div>

        {/* Master Brightness Slider */}
        <div className="relative flex flex-col items-center justify-center h-full">
          <label
            htmlFor="masterBrightnessSlider"
            className="mb-6 text-gray-700 font-bold text-center hidden "
          >
            Master Brightness
          </label>
          <div className="relative flex flex-col items-center h-full group">
            <div
              className={`absolute top-[-2.5rem] bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 transition-opacity duration-300 shadow-lg group-hover:opacity-90 z-50 ${
                isCycleRunning ? "" : "hidden"
              }`}
            >
              Stop cycle to adjust master brightness
            </div>

            {/* Slider */}
            <input
              type="range"
              id="masterBrightnessSlider"
              min="0"
              max="100"
              value={masterBrightness}
              onChange={handleMasterBrightnessChange}
              className={`w-40 h-2 bg-gray-300 rounded-lg appearance-none transform -rotate-90 origin-center focus:outline-none focus:ring-2 focus:ring-green-300 ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isMasterBrightnessEnabled || isCycleRunning}
            />
            {/* Percentage Text */}
            <span
              className={`mt-20 text-lg font-semibold ${
                isMasterBrightnessEnabled ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {masterBrightness}%
            </span>
          </div>
        </div>
      </div>

      <DndProvider backend={HTML5Backend}>
        <LightSetupSelector
          lights={lights}
          setLights={setLights}
          setNumLights={setNumLights}
          isCycleRunning={isCycleRunning}
        />
        <div
          className={`containers w-full lg:w-1/2 ${
            isCycleRunning ? "pointer-events-none" : ""
          }`}
        >
          <GridContainer
            containerId="container1"
            lights={containerLights("container1")}
            onDrop={handleDrop}
            onClick={handleClick}
            updateStartAddress={(id, newStartAddress) =>
              updateLight(id, { startAddress: newStartAddress })
            }
            updateChannel={(id, newChannel) =>
              updateLight(id, { channel: newChannel })
            }
          />
          <GridContainer
            containerId="container2"
            lights={containerLights("container2")}
            onDrop={handleDrop}
            onClick={handleClick}
            updateStartAddress={(id, newStartAddress) =>
              updateLight(id, { startAddress: newStartAddress })
            }
            updateChannel={(id, newChannel) =>
              updateLight(id, { channel: newChannel })
            }
          />

          <GridContainer
            containerId="container3"
            lights={containerLights("container3")}
            onDrop={handleDrop}
            onClick={handleClick}
            updateStartAddress={(id, newStartAddress) =>
              updateLight(id, { startAddress: newStartAddress })
            }
            updateChannel={(id, newChannel) =>
              updateLight(id, { channel: newChannel })
            }
          ></GridContainer>
          <GridContainer
            containerId="container4"
            lights={containerLights("container4")}
            onDrop={handleDrop}
            onClick={handleClick}
            updateStartAddress={(id, newStartAddress) =>
              updateLight(id, { startAddress: newStartAddress })
            }
            updateChannel={(id, newChannel) =>
              updateLight(id, { channel: newChannel })
            }
          />
        </div>
      </DndProvider>
      <LightModal
        showModal={showModal}
        setShowModal={setShowModal}
        addLight={addLight}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        lights={lights}
      />

      <DndProvider backend={HTML5Backend}></DndProvider>

      {/* show color/brightness editor only when light is selected*/}
      {selectedLights.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col pointer-events-auto">
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="self-center mb-1 w-full h-8"
            />
            <button
              onClick={() =>
                handleApplyChanges("http://localhost:5000/set-lights")
              }
            >
              Apply Color
            </button>
            <div className="my-2">
              <label htmlFor="intensitySlider">Intensity: </label>
              <input
                type="range"
                id="intensitySlider"
                min="0"
                max="100"
                value={lights.find((light) => light.selected)?.intensity || 0}
                onChange={handleIntensityChange}
              />
            </div>
            <button
              onClick={() =>
                handleApplyChanges("http://localhost:5000/set-brightness")
              }
            >
              Apply Brightness
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-row justify-center">
        {/* Button to open the modal */}
        <div className="relative group">
          {/* Tooltip */}
          {isCycleRunning && (
            <div className="absolute top-[-1.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 transition-opacity duration-300 shadow-lg group-hover:opacity-100">
              Stop cycle to use this functionality
            </div>
          )}
          <div className="lighttools-container flex justify-center bg-gray-100 p-4 rounded-xl shadow-lg m-6 w-fit relative">
            <div className="relative" ref={dropdownToggleRef}>
              <div
                className={`flex flex-row items-center border rounded-xl border-gray-300 bg-gray-200 px-4 py-2 pr-4 text-gray-700 cursor-pointer focus:border-blue-500 focus:outline-none w-40 h-11 overflow-hidden ${
                  isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <span className="truncate">
                  {selectedScene ? selectedScene.name : "Select scene"}
                </span>
                <span className="ml-auto">
                  {isOpen ? <FaAngleUp /> : <FaAngleDown />}
                </span>
              </div>
              {isOpen && !isCycleRunning && (
                <ul className="absolute bottom-full left-0 mb-2 w-full bg-gray-300 border border-gray-400 shadow-lg rounded overflow-hidden">
                  {scenes.length > 0 ? (
                    scenes.map((scene, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
                        onClick={() => {
                          handleItemClick(scene);
                          setIsOpen(false);
                        }}
                      >
                        {scene.name}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-500">No saved scenes</li>
                  )}
                </ul>
              )}
            </div>

            <button
              disabled={isCycleRunning}
              onClick={saveCurrentScene}
              className={`flex flex-row mx-2 ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Save scene
            </button>
            <button
              disabled={isCycleRunning}
              onClick={() => deleteCurrentScene(selectedScene?.id)}
              // className="flex flex-row"
              className={`flex flex-row ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Delete scene
            </button>
            <button
              disabled={isCycleRunning}
              onClick={resetLights}
              className={`ml-2 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex justify-center bg-gray-100 p-4 rounded-xl shadow-lg m-6 w-fit relative">
          <div className="relative">
            <button
              onClick={() => setShowSceneDropdown((prev) => !prev)}
              className="flex items-center border rounded-lg px-4 py-2 shadow"
            >
              <span>Scene cycler</span>
              <span className="ml-2">
                {showSceneDropdown ? <FaAngleUp /> : <FaAngleDown />}
              </span>
            </button>
            {showSceneDropdown && (
              <div
                ref={dropdownRef}
                className="absolute bottom-full left-0 mb-2 w-fit p-2 bg-gray-300 border border-gray-400 shadow-lg rounded z-10 min-w-64"
              >
                <SceneList
                  scenes={scenes}
                  startSceneCycle={startSceneCycle}
                  stopSceneCycle={stopSceneCycle}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-evenly">
          {/* <GPTColorForm></GPTColorForm> */}
        </div>
        {/* Button to open the modal */}
        <div className="relative group">
          {/* Tooltip */}
          {isCycleRunning && (
            <div className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 transition-opacity duration-300 shadow-lg group-hover:opacity-100">
              Stop cycle to use this functionality
            </div>
          )}

          <div className="lightsetup-container flex flex-row justify-center bg-gray-100 p-4 rounded-xl shadow-lg m-6 w-fit">
            <button
              className={`${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isCycleRunning}
              onClick={() => {
                setShowModal(true);
                setModalContent("addLight");
              }}
            >
              Add new light
            </button>
            <button
              className={`ml-2 ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isCycleRunning}
              onClick={() => {
                setModalContent("setupLights");
                setShowModal(true);
              }}
            >
              Lights setup
            </button>
          </div>
        </div>
        {/* Modal */}
        <LightModal
          showModal={showModal}
          setShowModal={setShowModal}
          addLight={addLight}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          modalContent={modalContent}
          handleFinishSetup={handleFinishSetup}
          lights={lights}
        />
      </div>
    </div>
  );
};

export default StageLights;
