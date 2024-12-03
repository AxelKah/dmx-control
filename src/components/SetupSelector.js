import React, { useEffect, useState } from "react";
import { FaSave, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import {
  getAllLights,
  deleteSavedLightSetup,
  updateSavedLightSetup,
  saveLights,
} from "../api/dmxApi";
import { useLightData } from "../contexts/lightsContext";

const LightSetupSelector = ({
  lights,
  setLights,
  setNumLights,
  isCycleRunning,
}) => {
  const [savedLights, setSavedLights] = useState([]);
  const {
    selectedLightSetup,
    setSelectedLightSetup,
    setScenes,
    setSelectedScenes,
  } = useLightData();

  useEffect(() => {
    const fetchLights = async () => {
      const lightsData = await getAllLights();
      setSavedLights(lightsData);
    };
    fetchLights();
  }, []);

  // to restore selected light setup after route changes
  useEffect(() => {
    if (selectedLightSetup && savedLights.length > 0) {
      const selectedSetup = savedLights.find(
        (light) => light.id === selectedLightSetup
      );
      if (selectedSetup) {
        setLights(selectedSetup.lights);
        setNumLights(selectedSetup.lights.length);
      }
    }
  }, [selectedLightSetup, savedLights, setLights, setNumLights]);

  const handleSetupChange = (e) => {
    if (isCycleRunning) {
      alert("Cannot change light setup while a cycle is running.");
      return;
    }

    const selectedId = parseInt(e.target.value);
    const selectedSetup = savedLights.find((light) => light.id === selectedId);
    if (selectedSetup) {
      setLights(selectedSetup.lights);
      setNumLights(selectedSetup.lights.length);
      setSelectedLightSetup(selectedId);
    }
  };

  const handleUpdate = async () => {
    if (selectedLightSetup) {
      const foundSelectedSetup = savedLights.find(
        (light) => light.id === selectedLightSetup
      );

      if (foundSelectedSetup) {
        const updatedName = prompt("Enter new name:", foundSelectedSetup.name);
        if (updatedName !== null) {
          await updateSavedLightSetup(selectedLightSetup, updatedName, lights);

          // get updated list
          const updatedLightsData = await getAllLights();
          setSavedLights(updatedLightsData);
        }
      }
    } else {
      alert("Please select a setup to update.");
    }
  };

  const handleDelete = async () => {
    if (selectedLightSetup) {
      if (
        window.confirm(
          "Are you sure you want to delete this setup? This will also delete all scenes created for this setup."
        )
      ) {
        await deleteSavedLightSetup(selectedLightSetup);

        // get updated list
        const updatedLightsData = await getAllLights();
        setSavedLights(updatedLightsData);
        setSelectedLightSetup(null);
        setLights([]);
        setNumLights(0);
      }
    } else {
      alert("Please select a setup to delete.");
    }
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
        setSelectedLightSetup(newSetup.id);
      }
    }
  };

  const handleNewSetup = () => {
    if (isCycleRunning) {
      alert("Cannot start a new setup while a cycle is running.");
      return;
    }
    setLights([]);
    setNumLights(0);
    setScenes([]);
    setSelectedScenes([]);
    setSelectedLightSetup(null);
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="relative group">
        {isCycleRunning && (
          <div className="absolute top-[4.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 transition-opacity duration-300 shadow-lg group-hover:opacity-100">
            Stop cycle to use this functionality
          </div>
        )}
        <div className="flex justify-center items-center flex-col lg:flex-row bg-gray-100 p-2 rounded-lg shadow-lg m-2">
          <div className="flex flex-row items-center">
          <label htmlFor="lightsetups-dropdown" className="font-bold text-sm text-nowrap">
            LIGHT SETUPS:{" "}
          </label>
          <select
            id="lights-dropdown"
            value={selectedLightSetup || ""}
            onChange={handleSetupChange}
            disabled={isCycleRunning}
            className={`w-full lg:w-56 ml-2 my-2 lg:my-0 bg-gray-300 border border-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 ${
              isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="" disabled>
              ...
            </option>
            {savedLights.map((light) => (
              <option key={light.id} value={light.id}>
                {light.name}
              </option>
            ))}
          </select>
          </div>
          <div className="flex flex-row mt-2 sm:mt-0">
            <button
              onClick={handleNewSetup}
              disabled={isCycleRunning}
              className={`ml-2 flex flex-row items-center ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaPlus className="mr-1" /> New setup
            </button>
            <button
              onClick={handleUpdate}
              disabled={isCycleRunning}
              className={`ml-2 flex flex-row items-center ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaEdit className="mr-1" /> Update selected
            </button>
            <button
              onClick={handleSave}
              disabled={isCycleRunning}
              className={`ml-2 flex flex-row items-center ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaSave className="mr-1" />
              Save as new
            </button>
            <button
              onClick={handleDelete}
              disabled={isCycleRunning}
              className={`ml-2 flex flex-row items-center bg-red-500 hover:bg-red-600 ${
                isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaTrash className="mr-1" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightSetupSelector;
