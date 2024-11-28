import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GridContainer from "./GridContainer";
import LightModal from "./LightModal";
import SetupLights from "./SetupLights";
import Light from "../models/Light";
import { updateSelectedLights, makeApiCall, addMultipleLights, makeCycleApiCall } from "../utils/utils";
import GPTColorForm from "./GPTColorForm";
import { FaSave, FaEdit, FaTrash } from "react-icons/fa";
import SceneList from "./SceneList";
import SceneListBtn from "./SceneList";
import SceneListDemo from "./SceneListDemo";
import LightSetupSelector from "./SetupSelector";
import PresetBtn from "./PresetBtn";
import { PresetScene1, PresetScene2 } from "./PresetScene";
import { setMasterBrightness } from "../api/dmxApi";


const StageLights = () => {
  const [lights, setLights] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [numLights, setNumLights] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [color, setColor] = useState("#ffffff");
  const selectedLights = lights.filter((light) => light.selected);



  const valotlogiin = () => {
    console.log("valotlogiin");
    console.log(lights);
  };


  const sendLightsStateToServer = async (updatedLights) => {
    try {
      await makeApiCall("http://localhost:5000/track-lights", updatedLights);
      console.log("Lights state sent to server");
    } catch (error) {
      console.error("Error sending lights state to server:", error);
    }
  };


  const addLight = (channel, startAddress) => {
    console.log("Adding light");
    const id = parseInt(numLights + 1);
    const newLight = new Light(id, channel, startAddress);
    const updatedLights = [...lights, newLight];
    setLights(updatedLights);
    setNumLights(parseInt(numLights + 1));
    sendLightsStateToServer(updatedLights);
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
    console.log("tuleeks tää ny useemman kerran");
    const selectedLights = lights.filter((light) => light.selected);
    await makeApiCall(url, selectedLights);
  };

  const handleSceneChanges = async (url, sceneLights) => {
    setLights(sceneLights);
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




  const getCurrentLights = () => {
    lights.forEach((light) => {
      console.log(`Light ID: ${light.id}, Color: ${light.color}`);
    });
    console.log(scenes);
    return lights;
  };



  const handleMasterBrightnessChange = (e) => {
    const brightness = parseInt(e.target.value);
    const updatedLights = [...lights];
    setLights((updatedLights) =>
      updatedLights.map((light) => ({ ...light, brightness }))
    );
    setMasterBrightness(brightness);
  };




  const [cycleInterval, setCycleInterval] = useState(null);

  const startSceneCycle = async (scene1, scene2, interval) => {
    if (scene1.length === 0 || scene2.length === 0) {
      console.error("Both scenes must have at least one light");
      scene1 = PresetScene1
      scene2  = PresetScene2

    }
    console.log("Starting scene cycle " + interval);
    handleCycleApiCall(scene1, scene2, interval);
  };



  const startSceneCycle2 = async (scene1, scene2, interval) => {
    if (scene1.length === 0 || scene2.length === 0) {
      console.error("Both scenes must have at least one light");
      scene1 = PresetScene1
      scene2  = PresetScene2

    }
    console.log("Starting scene cycle " + interval);
    handleCycleApiCall(scene1, scene2, interval);
  };



  const stopSceneCycle = async () => {
    await makeApiCall("http://localhost:5000/stop-cycle", [0]);
  };

  const handleCycleApiCall = async (lightsArray1, lightsArray2, interval) => {
    console.log(interval + " interval api callissa");
    if (!Array.isArray(lightsArray1) || !Array.isArray(lightsArray2)) {
      console.error(
        "lightsArray1 and lightsArray2 must be arrays"
      );
      return;
    }
    console.log("arrays", lightsArray1, lightsArray2);

    await makeCycleApiCall("http://localhost:5000/set-cycle15m", {
      lightsArray1,
      lightsArray2,
      interval,
    });
  };





  const handleCycleApiCall1h = async (lightsArray1, lightsArray2, interval) => {
    console.log(interval + " interval api callissa");
    if (!Array.isArray(lightsArray1) || !Array.isArray(lightsArray2)) {
      console.error(
        "lightsArray1 and lightsArray2 must be arrays"
      );
      return;
    }
    console.log("arrays", lightsArray1, lightsArray2);

    await makeCycleApiCall("http://localhost:5000/set-cycle1h", {
      lightsArray1,
      lightsArray2,
      interval,
    });
  };




  const saveCurrentScene = () => {
    const sceneName = "scene" + (scenes.length + 1);
    const scene = {
      name: prompt("Enter scene name"),
      lights: lights.map((light) => ({
        id: light.id,
        color: light.color,
        intensity: light.intensity,
        channel: light.channel,
        startAddress: light.startAddress,
        containerId: light.containerId,
      })),
    };
    setScenes([...scenes, scene]);
    console.log(scenes);
  };

  const handleItemClick = (item) => {
    handleSceneChanges("http://localhost:5000/set-scene", item.lights);
  };


  return (
    <div>
            <div>
            <PresetBtn lights={lights} startCycle={startSceneCycle} startCycle1h={startSceneCycle2}></PresetBtn>
              <label htmlFor="masterBrightnessSlider">Master Brightness: </label>
              <input
                type="range"
                id="masterBrightnessSlider"
                min="1"
                max="255"
                onMouseUp={handleMasterBrightnessChange}
                className="slider"
              />
            </div>
    <div>
      <DndProvider backend={HTML5Backend}>
        <LightSetupSelector
          lights={lights}
          setLights={setLights}
          setNumLights={setNumLights}
        />
        <div className="containers w-full lg:w-1/2">
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
        <div className="lighttools-container flex justify-center bg-gray-100 p-4 rounded-lg shadow-lg m-6 w-fit">
          <button onClick={getCurrentLights}>tessadsadt</button>

        </div>
        <div className="flex flex-col justify-evenly">
          <GPTColorForm></GPTColorForm>
        </div>
        {/* Button to open the modal */}
        <div className="lightsetup-container flex flex-row justify-center bg-gray-100 p-4 rounded-lg shadow-lg m-6 w-fit">
          <button
            onClick={() => {
              setShowModal(true);
              setModalContent("addLight");
            }}
            style={{
              marginLeft: "10px",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            Add new light
          </button>
          <button
            onClick={() => {
              setModalContent("setupLights");
              setShowModal(true);
            }}
            style={{
              marginLeft: "10px",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
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
      <div className="flex flex-row justify-center">
        
      <button onClick={saveCurrentScene} className="mx-2">
            Save current scene
          </button>
          <SceneListDemo scenes={scenes} startSceneCycle={startSceneCycle} />
          <button onClick={stopSceneCycle} className="ml-2">
            Stop cycle
          </button>
        
        </div>
    </div>
    </div>

  );
};

export default StageLights;
