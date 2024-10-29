import React, { useState } from "react";
import "../lightGrid.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LightBox from "./LightBox2";
import GridContainer from "./GridContainer";
import SetupLights from "./SetupLights";

const LightGrid = ({ onLightSelect }) => {
  const [numLights, setNumLights] = useState(0); // Default to 11 lights
  // This should be modified later
  const [lights, setLights] = useState([]);
  const [color, setColor] = useState("#ffffff");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(""); // Modal content 

  const [newLightId, setNewLightId] = useState("");
  const [newLightChannels, setNewLightChannels] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDrop = (item, newContainerId) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === item.id ? { ...light, containerId: newContainerId } : light
      )
    );
  };
/*
  const addLight = (id, channel, containerId = "container1", color = "#fff") => {
    if (!isNaN(id) && !isNaN(channel)) {
      const existingLight = lights.find((light) => light.id === id);
      if (existingLight) {
        alert(`A light with ID ${id} already exists.`);
      } else {
        setLights([...lights, { id, selected: false, containerId, color, channel }]);
        console.log(`Added light with ID ${id} and ${containerId} container.`);
        setNumLights(parseInt(numLights + 1));
        console.log(`Number of lights: ${numLights}`);
      }
    }
  };
*/

  const containerLights = (containerId) =>
    lights.filter((light) => light.containerId === containerId);




  // For rendering the lights in the container (not working for later date to fix / delete)
  const renderLights = (lights) => {
    return lights.map((light) => (
      <div
        key={light.id}
        className={`light ${light.selected ? "selected" : ""}`}
        style={{ backgroundColor: light.color }}
        onClick={() => handleClick(light)}
      >
        {`Light address ${light.id}`}
      </div>
    ));
  };

  // Function to handle the number of lights(old)
  
  const handleNumLightsChange = (e) => {
    const newNumLights = parseInt(e.target.value);
    setNumLights(newNumLights);
    setLights(
      Array.from({ length: newNumLights }, (_, i) => ({
        id: i + 1,
        selected: false,
        containerId: "container1",
        color: "#fff",
        channel: i + 1, // Assigning channel value
        startAddress: 0, // Assigning start address
      }))
    );
  };

  const handleAddLight = () => {
    const id = parseInt(prompt("Enter light ID:"));
    const channel = parseInt(
      prompt("Enter how many channels does the light have:")
    );
    if (!isNaN(id) && !isNaN(channel)) {
      const existingLight = lights.find((light) => light.id === id);
      if (existingLight) {
        alert(`A light with ID ${id} already exists.`);
      } else {
        setLights([...lights, { id, selected: false, color: "#fff", channel }]);
      }
    }
  };

  // Moving the lights between containers in any order(Not working for later date to fix)
  const moveLight = (dragIndex, hoverIndex) => {
    const updatedLights = [...lights];
    const [removed] = updatedLights.splice(dragIndex, 1);
    updatedLights.splice(hoverIndex, 0, removed);
    setLights(updatedLights);
  };

  const handleClick = (clickedLight) => {
    setLights(
      lights.map((light) =>
        light.id === clickedLight.id
          ? {
              ...light,
              selected: !light.selected,
              color: light.selected ? "#fff" : "#f00",
            }
          : light
      )
    );
    onLightSelect(clickedLight);
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
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
            color,
            channel: light.channel,
            startAddress: light.startAddress,
          })),
        }),
      });
    }
  };

  const openModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  // Handle  form submission inside modal
  const handleModalSubmit = () => {
    const id = parseInt(newLightId);
    const channel = parseInt(newLightChannels);
    if (!isNaN(id) && !isNaN(channel)) {
      //checks if light with the same ID already exists
      const existingLight = lights.find((light) => light.id === id);
      if (existingLight) {
        setErrorMessage(`A light with ID ${id} already exists.`);
      } else {
        setLights([...lights, { id, selected: false, color: "#fff", containerId: "container1", channel }]);

        setShowModal(false);
        setNewLightId("");
        setNewLightChannels("");
        setErrorMessage("");
      }
    }
  };

  const handleNewLightIdChange = (e) => {
    const id = parseInt(e.target.value);
    setNewLightId(e.target.value);
    if (!isNaN(id)) {
      // Find the existing light with the same ID or where the ID falls within its channel range
      const existingLight = lights.find(
        (light) => id >= light.id && id < light.id + light.channel
      );

      if (existingLight) {
        // Calculate the range of channels occupied by the existing light
        const channelRange = `${existingLight.id}-${
          existingLight.id + existingLight.channel - 1
        }`;
        //Set error message that shows if the id is already occupied
        setErrorMessage(
          <>
            {`ID `}
            <strong>{id}</strong>
            {` is already occupied by a light with `}
            <strong>{existingLight.channel}</strong>
            {` channels.`}
            <br />
            {`Occupied ID/Channel range: `}
            <strong>{channelRange}</strong>
            {`.`}
          </>
        );
      } else {
        setErrorMessage("");
      }
    } else {
      setErrorMessage("");
    }
  };

  const logLightsAndChannels = () => {
    lights.forEach((light) => {
      console.log(`Light ID: ${light.id}, Channel: ${light.channel}`);
    });
  };

  const handleFinishSetup = (values) => {
    console.log("Finished! Collected values:", values);
    addLightsFromSetup(values);
  };

  const addLightsFromSetup = (values) => {
    const { left, back, right } = values.sides; // Get the user-specified values

    let currentId = numLights; // Start with the current value of numLights

    // Helper function to add multiple lights to a specific container
    const addMultipleLights = (numLightsToAdd, containerId) => {
        const newLights = []; // Temporary array to store new lights for batch update

        for (let i = 0; i < numLightsToAdd; i++) {
            currentId++; // Increment the local variable for each new light
            newLights.push({
                id: currentId,
                selected: false,
                containerId: containerId,
                color: "#fff",
                channel: 1,
                startAddress: 0,
            });
        }

        setLights((prevLights) => [...prevLights, ...newLights]); // Batch update lights array
    };

    // Add lights to each container based on user input
    addMultipleLights(left, "container1");   // Add lights to container1
    addMultipleLights(back, "container2");   // Add lights to container2
    addMultipleLights(right, "container3");  // Add lights to container3

    setNumLights(currentId); // Update numLights to reflect the final ID used
};


  // Call the function to log lights and channels
  logLightsAndChannels();

  return (
    <div>
      <div>
        <label>
          Number of Light Fixtures:
          <input
            type="number"
            value={numLights}
            onChange={handleNumLightsChange}
            min="1"
            style={{
              marginLeft: "10px",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </label>
        <button
          onClick={handleAddLight}
          style={{
            marginLeft: "10px",
            padding: "5px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          Add Light
        </button>
      </div>
      <div>
        <DndProvider backend={HTML5Backend}>
          <div className="containers">
            <GridContainer
              containerId="container1"
              lights={containerLights("container1")}
              onDrop={handleDrop}
              onClick={handleClick}
            />
            <GridContainer
              containerId="container2"
              lights={containerLights("container2")}
              onDrop={handleDrop}
              onClick={handleClick}
            />
            <GridContainer
              containerId="container3"
              lights={containerLights("container3")}
              onDrop={handleDrop}
              onClick={handleClick}
            ></GridContainer>
          </div>
        </DndProvider>
      </div>

      <DndProvider backend={HTML5Backend}></DndProvider>
      <input type="color" value={color} onChange={handleColorChange} />
      <button onClick={handleApplyColor}>Apply Color</button>

      {/* Button to open the modal */}
      <button
        onClick={() => openModal("addLight")}
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
        onClick={() => openModal("setupLights")}
        style={{
          marginLeft: "10px",
          padding: "5px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      >
        Lights setup
      </button>
      {/* Modal to input new light information */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
          {modalContent === "addLight" && (
              <>
                <h2>Add New Light</h2>
                <label>
                  Light ID:
                  <input
                    type="number"
                    value={newLightId}
                    onChange={handleNewLightIdChange}
                    min="1"
                  />
                </label>
                <br />
                <label>
                  Number of Channels:
                  <input
                    type="number"
                    value={newLightChannels}
                    onChange={(e) => setNewLightChannels(e.target.value)}
                    min="1"
                  />
                </label>
                <br />
                {errorMessage && <p className="error">{errorMessage}</p>}
                <button onClick={handleModalSubmit} disabled={!!errorMessage}>
                  Submit
                </button>
              </>
            )}
            {modalContent === "setupLights" && (
              <>
                <SetupLights onClose={() => setShowModal(false)} onFinish={handleFinishSetup} />

              </>
            )}
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightGrid;
