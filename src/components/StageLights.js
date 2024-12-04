import React, { useState, useEffect } from "react";
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
import MasterBrightnessController from "./MasterBrightness";
import { FaPlus, FaGripVertical } from "react-icons/fa6";
import CircularColorPicker from "./ColorPicker";

const StageLights = () => {
  const {
    selectedLightSetup,
    isCycleRunning,
    setIsCycleRunning,
    masterBrightness,
    isMasterBrightnessEnabled,
  } = useLightData();
  const [lights, setLights] = useState([]);
  const [numLights, setNumLights] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const selectedLights = lights.filter((light) => light.selected);

  useEffect(() => {
    // to position modal in the middle of light grid containers
    const positionModal = () => {
      const target = document.getElementById("lightgrid-containers");
      const floating = document.getElementById("editorModal");

      if (!target || !floating) return;

      const targetRect = target.getBoundingClientRect();

      const targetCenterX =
        targetRect.left + targetRect.width / 2 + window.scrollX;
      const targetCenterY =
        targetRect.top + targetRect.height / 2 + window.scrollY;

      floating.style.position = "absolute";
      floating.style.left = `${targetCenterX - floating.offsetWidth / 2}px`;
      floating.style.top = `${targetCenterY - floating.offsetHeight / 2}px`;
    };

    if (selectedLights.length > 0) {
      positionModal();
    }

    const handleUpdate = () => {
      if (selectedLights.length > 0) {
        positionModal();
      }
    };
    window.addEventListener("scroll", handleUpdate);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [selectedLights]);

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

  const handleColorChange = (selectedColor) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.selected ? { ...light, color: selectedColor } : light
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
      <DndProvider backend={HTML5Backend}>
        <LightSetupSelector
          lights={lights}
          setLights={setLights}
          setNumLights={setNumLights}
          isCycleRunning={isCycleRunning}
        />
        <div
          id="lightgrid-containers"
          className={`containers w-full 2xl:w-1/2 ${
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
        <div
          id="editorModal"
          className="fixed inset-0 bottom-20 flex items-center justify-center pointer-events-none z-[100] h-[96%] max-w-[415px]"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-row items-end pointer-events-auto max-w-[415px]">
            <div className="flex flex-col mx-2">
              <CircularColorPicker onColorSelect={handleColorChange} />
              <input
                type="color"
                value={
                  selectedLights.length === 1 ||
                  selectedLights.every(
                    (light) => light.color === selectedLights[0]?.color // if all have same color, show it
                  )
                    ? selectedLights[0]?.color || "#ffffff"
                    : "#cccccc"
                }
                onChange={(e) => handleColorChange(e.target.value)}
                className="self-center mb-1 w-full h-8"
              />

              <button
                onClick={() =>
                  handleApplyChanges("http://localhost:5000/set-lights")
                }
              >
                Apply color
              </button>
            </div>
            <div className="flex flex-col ml-6 max-w-36 relative">
              {isMasterBrightnessEnabled && (
                <div className="absolute top-[2rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-md px-2 py-1 shadow-lg select-none z-50">
                  Master brightness is enabled
                </div>
              )}
              <div className="my-2 flex flex-col">
                <label htmlFor="intensitySlider"> </label>
                <input
                  type="range"
                  id="intensitySlider"
                  min="0"
                  max="100"
                  value={lights.find((light) => light.selected)?.intensity || 0}
                  onChange={handleIntensityChange}
                  disabled={isMasterBrightnessEnabled}
                  className="h-[140px] -rotate-90"
                />
                <span className="flex justify-center mt-2 select-none">
                  {lights.find((light) => light.selected)?.intensity || 0} %
                </span>
              </div>

              <button
                disabled={isMasterBrightnessEnabled}
                className={`text-nowrap ${
                  isMasterBrightnessEnabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  handleApplyChanges("http://localhost:5000/set-brightness")
                }
              >
                Apply brightness
              </button>
            </div>
            <button
              onClick={() =>
                setLights((prevLights) =>
                  prevLights.map((light) => ({ ...light, selected: false }))
                )
              }
              className="relative right-[-8px] top-[-17px] bg-red-500 text-white text-center rounded-full w-6 h-6 flex items-center justify-center self-start shadow-md cursor-pointer"
            >
              &#10006;
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center items-center lg:space-x-6 lg:space-y-0">
        <div className="relative group flex-[1_1_100%] md:flex-[1_1_50%] lg:flex-[0_0_auto] max-w-fit">
          {isCycleRunning && (
            <div className="absolute top-[-1.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 transition-opacity duration-300 shadow-lg group-hover:opacity-100">
              Stop cycle to use this functionality
            </div>
          )}
          <div className="scenetools-container flex justify-center bg-gray-100 p-4 rounded-xl shadow-lg m-6 relative md:text-nowrap">
            <SceneControls
              lights={lights}
              setLights={setLights}
              isCycleRunning={isCycleRunning}
              selectedLightSetup={selectedLightSetup}
            />
          </div>
        </div>
        <div className="scenecycler-container flex-[1_1_100%] md:flex-[1_1_50%] lg:flex-[0_0_auto] flex justify-center bg-gray-100 p-4 rounded-xl shadow-lg m-6 max-w-fit">
          <SceneCycler
            lights={lights}
            setLights={setLights}
            isCycleRunning={isCycleRunning}
            setIsCycleRunning={setIsCycleRunning}
            masterBrightness={masterBrightness}
            isMasterBrightnessEnabled={isMasterBrightnessEnabled}
          />
        </div>
        {/*  <div className="flex flex-col justify-evenly">
          <GPTColorForm></GPTColorForm>
        </div>
        */}
        <div className="lightsetup-container relative group flex-[1_1_100%] sm:flex-[1_1_50%] md:flex-[1_1_100%] lg:flex-[0_0_auto] max-w-fit">
          {isCycleRunning && (
            <div className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 transition-opacity duration-300 shadow-lg group-hover:opacity-100">
              Stop cycle to use this functionality
            </div>
          )}
          <div className="flex flex-row justify-center bg-gray-100 p-4 rounded-xl shadow-lg m-6">
            <button
              className={`flex flex-row items-center ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isCycleRunning}
              onClick={() => {
                setShowModal(true);
                setModalContent("addLight");
              }}
            >
              <FaPlus className="mr-1" /> Add new light
            </button>
            <button
              className={`ml-2 flex flex-row items-center ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isCycleRunning}
              onClick={() => {
                setModalContent("setupLights");
                setShowModal(true);
              }}
            >
              <FaGripVertical className="mr-1" /> Lights setup
            </button>
          </div>
        </div>
        <MasterBrightnessController
          lights={lights}
          setLights={setLights}
          handleApplyChanges={handleApplyChanges}
          isCycleRunning={isCycleRunning}
        />
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
