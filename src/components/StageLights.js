import React, { useState } from "react";
import "../StageLights.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GridContainer from "./GridContainer";
import LightModal from "./LightModal";

const StageLights = ({ onLightSelect }) => {
  const [numLights, setNumLights] = useState(0);
  const [lights, setLights] = useState([]);
  const [color, setColor] = useState("#ffffff");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(""); // Modal content
  const [errorMessage, setErrorMessage] = useState("");

  const handleDrop = (item, newContainerId) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === item.id ? { ...light, containerId: newContainerId } : light
      )
    );
  };

  const containerLights = (containerId) =>
    lights.filter((light) => light.containerId === containerId);

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
    onLightSelect(clickedLight);
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
    setLights((prevLights) =>
      prevLights.map((light) => (light.selected ? { ...light, color: e.target.value } : light))
    );
  };


  const handleApplyColor = async () => {
    const selectedLights = lights.filter((light) => light.selected);
    if (selectedLights.length > 0) {
      await fetch("http://localhost:5000/set-lights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lights: selectedLights.map((light) => ({
            id: light.id,
            color: light.color,
            channel: light.channel,
            startAddress: light.startAddress,
            intensity: light.intensity,
          })),
        }),
      });
    }
  };

  const handleIntensityChange = (e) => {
    const intensity = parseInt(e.target.value);
    setLights((prevLights) =>
      prevLights.map((light) => (light.selected ? { ...light, intensity } : light))
    );
  };

  const handleApplyIntensity = async () => {
    const selectedLights = lights.filter((light) => light.selected);
    if (selectedLights.length > 0) {
      await fetch("http://localhost:5000/set-brightness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lights: selectedLights.map((light) => ({
            id: light.id,
            color: light.color,
            channel: light.channel,
            startAddress: light.startAddress,
            intensity: light.intensity,
          })),
        }),
      });
    }
  };
  
  const addLight = (channel, startAddress) => {
    console.log("rsweesrse");
    const id = parseInt(numLights + 1);
    setLights([
      ...lights,
      {
        id,
        selected: false,
        color: "#fff",
        containerId: "container1",
        channel,
        startAddress,
        intensity: 97,
      },
    ]);
    setNumLights(parseInt(numLights + 1));
  };

  const handleFinishSetup = (values) => {
    console.log("Finished! Collected values:", values);
    addLightsFromSetup(values);
  };

  const addLightsFromSetup = (values) => {
    const { left, back, right, front } = values.sides;

    let currentId = numLights;

    // Helper function to add multiple lights to a specific container
    const addMultipleLights = (numLightsToAdd, containerId) => {
      const newLights = []; // Array to store the new lights

      for (let i = 0; i < numLightsToAdd; i++) {
        currentId++; // Increment the current ID
        newLights.push({
          id: currentId,
          selected: false,
          containerId: containerId,
          color: "#fff",
          channel: 1,
          startAddress: 0,
          intensity: 98,
        });
      }

      setLights((prevLights) => [...prevLights, ...newLights]); // Update the lights state with the new lights
    };

    // Add lights to each container based on user input
    addMultipleLights(left, "container1"); // Add lights to container1
    addMultipleLights(back, "container2"); // Add lights to container2
    addMultipleLights(right, "container3"); // Add lights to container3
    addMultipleLights(front, "container4"); // Add lights to container4
    setNumLights(currentId); // Update numLights to reflect the final ID used
  };

  const updateStartAddress = (id, newStartAddress) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, startAddress: newStartAddress } : light
      )
    );
  };

  const updateChannel = (id, newChannel) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, channel: newChannel } : light
      )
    );
  };

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <div className="containers">
          <GridContainer
            containerId="container1"
            lights={containerLights("container1")}
            onDrop={handleDrop}
            onClick={handleClick}
            updateStartAddress={updateStartAddress}
            updateChannel={updateChannel}
          />
          <GridContainer
            containerId="container2"
            lights={containerLights("container2")}
            onDrop={handleDrop}
            onClick={handleClick}
            updateStartAddress={updateStartAddress}
            updateChannel={updateChannel}
          />

          <GridContainer
            containerId="container3"
            lights={containerLights("container3")}
            onDrop={handleDrop}
            onClick={handleClick}
            updateStartAddress={updateStartAddress}
            updateChannel={updateChannel}
          ></GridContainer>
          <GridContainer
            containerId="container4"
            lights={containerLights("container4")}
            onDrop={handleDrop}
            onClick={handleClick}
            updateStartAddress={updateStartAddress}
            updateChannel={updateChannel}
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
      <input type="color" value={color} onChange={handleColorChange} />
      <button onClick={handleApplyColor}>Apply Color</button>
      <button onClick={handleApplyIntensity}>Apply Brightness</button>

      {/* Button to open the modal */}
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
          setShowModal(true);
          setModalContent("setupLights");
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
      <div style={{ marginTop: "10px" }}>
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
      {/* Modal to input new light information */}
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
  );
};

export default StageLights;
