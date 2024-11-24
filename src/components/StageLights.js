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

  const handleApplyChanges = async (url) => {
    const selectedLights = lights.filter((light) => light.selected);
    await makeApiCall(url, selectedLights);
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

  const startSceneCycle = async (selectedScenes, interval = 1500) => {
    if (!Array.isArray(selectedScenes) || selectedScenes.length !== 2) {
      alert("Please select exactly two scenes.");
      return;
    }

    const [scene1, scene2] = selectedScenes;

    // scenes should have valid "colors" arrays
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
      const sceneLightsArrays = [scene1.colors, scene2.colors];

      console.log("Starting scene cycle with lightsArray:", sceneLightsArrays);

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
              (color) => color.lightId === existingLight.id
            );

            if (matchingColor) {
              return {
                ...existingLight,
                color: matchingColor.color,
                intensity: matchingColor.intensity,
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

        // cycle to the next scene
        currentIndex = (currentIndex + 1) % sceneLightsArrays.length;
      };

      // Clear intervals before starting a new one
      if (cycleInterval) {
        clearInterval(cycleInterval);
      }

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
        intensity: light.intensity,
      })),
    };
    setScenes([...scenes, scene]);
    saveScenes(scene);
  };

  const deleteCurrentScene = (sceneId) => {
    console.log("Deleting scene with ID: ", sceneId);

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
            onClick={(e) => {
              if (selectedScene) {
                deleteCurrentScene(selectedScene.id);
              }
            }}
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
          <GPTColorForm></GPTColorForm>
        </div>
        {/* Button to open the modal */}
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
