import React, { useState } from "react";
import LightGrid from "../components/LightGrid";
import StageLights from "../components/StageLights";
import {
  startRainbow,
  stopRainbow,
  startPoliceLights,
  stopPoliceLights,
} from "../api/dmxApi";

function DebugPage() {
  const [channel, setChannel] = useState(1);
  const [value, setValue] = useState(0);
  const [isRainbowActive, setIsRainbowActive] = useState(false);
  const [isPoliceLightsActive, setIsPoliceLightsActive] = useState(false);
  const [selectedLights, setSelectedLights] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/set-channel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel, value }),
    });

    if (response.ok) {
      console.log(`Successfully set channel ${channel} to ${value}`);
    } else {
      console.error("Failed to set channel");
    }
  };

  // Handle rainbow effect toggle
  const handleRainbowToggle = () => {
    if (isRainbowActive) {
      stopRainbow();
    } else {
      startRainbow();
    }
    setIsRainbowActive(!isRainbowActive);
  };

  // Handle police lights effect toggle
  const handlePoliceLightsToggle = () => {
    if (isPoliceLightsActive) {
      stopPoliceLights();
    } else {
      startPoliceLights();
    }
    setIsPoliceLightsActive(!isPoliceLightsActive);
  };

  // Function to clear all lights
  const clearLights = async () => {
    const response = await fetch("http://localhost:5000/clear-lights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("Successfully cleared all lights");
    } else {
      console.error("Failed to clear lights");
    }
  };

  const handleTestChannels = async () => {
    await fetch("http://localhost:5000/test-channels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

/*
  const handleLogLights = async () => {
    await fetch("http://localhost:5000/log-lights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
*/


  const handleLightSelect = (lights) => {
    setSelectedLights(lights);
  };

/*
  const handleApplyColor = async () => {
    if (selectedLights) {
      await fetch("http://localhost:5000/set-lights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lights: [{ id: selectedLights.id, color }] }),
      });
    }
  };
*/
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#333" }}>Light Control</h1>
       <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          Light Channel:
          <input
            type="number"
            value={channel}
            onChange={(e) => setChannel(parseInt(e.target.value))}
            min="1"
            max="512"
            style={{
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          Value (0-255):
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value))}
            min="0"
            max="255"
            style={{
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Set DMX Channel
        </button>
        <button
          type="button"
          onClick={handleRainbowToggle}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: isRainbowActive ? "#FF0000" : "#28A745",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isRainbowActive ? "Stop Rainbow Effect" : "Start Rainbow Effect"}
        </button>
        <button
        type="button"
          onClick={handlePoliceLightsToggle}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: isPoliceLightsActive ? "#FF0000" : "#28A745",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isPoliceLightsActive
            ? "Stop Police Lights Effect"
            : "Start Police Lights Effect"}
        </button>
        <button
          type="button"
          onClick={handleTestChannels}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Test Channels
        </button>
        <button
          type="button"
          onClick={clearLights}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Clear Lights
        </button>
       
      </form> 
      <div>
        {/* <h1>DMX Light Control</h1> */}
        <StageLights onLightSelect={handleLightSelect} />
      </div>{" "}
    </div>
  );
}

export default DebugPage;
