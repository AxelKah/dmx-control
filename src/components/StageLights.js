import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GridContainer from "./GridContainer";
import LightModal from "./LightModal";
import Light from "../models/Light";
import { makeApiCall, addMultipleLights } from "../utils/utils";
// import GPTColorForm from "./GPTColorForm";
import SceneControls from "./SceneControls";
import SceneCycler from "./SceneCycler";
import LightSetupSelector from "./SetupSelector";
import { useLightData } from "../contexts/lightsContext";

const StageLights = () => {
  const { selectedLightSetup, isCycleRunning, setIsCycleRunning } =
    useLightData();
  const [lights, setLights] = useState([]);
  const [numLights, setNumLights] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [color, setColor] = useState("#ffffff");
  const selectedLights = lights.filter((light) => light.selected);
  const [masterBrightness, setMasterBrightness] = useState(100);
  const [isMasterBrightnessEnabled, setIsMasterBrightnessEnabled] =
    useState(false);
  const [originalIntensity, setOriginalIntensity] = useState([]);

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
      await makeApiCall(url, updatedLights);
    } catch (error) {
      console.error("Error applying changes:", error);
    }
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

  return (
    <div>
      <div className="master-brightness-container flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-lg m-6 w-32 justify-between absolute top-1/3 left-1 md:left-36 transform -translate-y-1/2">
        {/* Master brightness */}
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
          <div className="scenetools-container flex justify-center bg-gray-100 p-4 rounded-xl shadow-lg m-6 w-fit relative">
            <SceneControls
              lights={lights}
              setLights={setLights}
              isCycleRunning={isCycleRunning}
              selectedLightSetup={selectedLightSetup}
            />
          </div>
        </div>
        <div className="scenecycler-container flex justify-center bg-gray-100 p-4 rounded-xl shadow-lg m-6 w-fit relative">
          <SceneCycler
            lights={lights}
            setLights={setLights}
            isCycleRunning={isCycleRunning}
            setIsCycleRunning={setIsCycleRunning}
            masterBrightness={masterBrightness}
            isMasterBrightnessEnabled={isMasterBrightnessEnabled}
          />
        </div>

        <div className="flex flex-col justify-evenly">
          {/* <GPTColorForm></GPTColorForm> */}
        </div>
        {/* Button to open the modal */}
        <div className="lightsetup-container relative group">
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
