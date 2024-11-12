import React, { useState, useEffect } from "react";
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
} from "../utils/utils";
import GPTColorForm from "./GPTColorForm";
import { saveLights, getAllLights } from "../api/dmxApi";

const StageLights = () => {
  const [lights, setLights] = useState([]);
  const [numLights, setNumLights] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [savedLights, setSavedLights] = useState([]);
  const [selectedLightSetup, setSelectedLightSetup] = useState(null);

  useEffect(() => {
    const fetchLights = async () => {
      const lightsData = await getAllLights();
      setSavedLights(lightsData);
    };
    fetchLights();
  }, []);

  // for changing selected light setup
  const handleSetupChange = (e) => {
    const selectedId = e.target.value;
    const selectedSetup = savedLights.find((light) => light._id === selectedId);
    if (selectedSetup) {
      setLights(selectedSetup.lights);
      setNumLights(selectedSetup.lights.length);
    }
    setSelectedLightSetup(selectedId);
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

  const handleApplyChanges = async (url) => {
    const selectedLights = lights.filter((light) => light.selected);
    await makeApiCall(url, selectedLights);
  };

  const handleFinishSetup = (values) => {
    console.log("Finished! Collected values:", values);
    addLightsFromSetup(values);
  };

  const handleSave = async () => {
    const name = "Config: " + new Date().toLocaleString();
    const namePrompt = prompt("Enter name:", name);
    const allLights = lights;

    if (namePrompt !== null) {
      await saveLights(namePrompt, allLights);

      // get updated list
      const updatedLightsData = await getAllLights();
      setSavedLights(updatedLightsData);

      // set as currently selected
      const newSetup = updatedLightsData.find(
        (lightSetup) => lightSetup.name === namePrompt
      );
      if (newSetup) {
        setSelectedLightSetup(newSetup._id);
      }
    }
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
        <div className="flex justify-center">
          <label htmlFor="lightsetups-dropdown">
            Select from saved setups:{" "}
          </label>
          <select
            id="lights-dropdown"
            value={selectedLightSetup || ""}
            onChange={handleSetupChange}
          >
            <option value="" disabled>
              ...
            </option>
            {savedLights.map((light) => (
              <option key={light._id} value={light._id}>
                {light.name}
              </option>
            ))}
          </select>
        </div>

        <div className="containers">
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

      <div className="flex flex-row justify-center">
        <div className="lighttools-container flex flex-col justify-center bg-gray-100 p-4 rounded-lg shadow-lg m-6 w-fit">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="self-center mb-1"
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
        <div className="flex flex-col justify-evenly">
          <GPTColorForm></GPTColorForm>
          <button onClick={() => handleSave()}>Save setup</button>
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
    </div>
  );
};

export default StageLights;
