import React, { useEffect, useState } from "react";
import { FaSave, FaEdit, FaTrash } from "react-icons/fa";
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
  const { selectedLightSetup, setSelectedLightSetup } = useLightData();

  useEffect(() => {
    const fetchLights = async () => {
      const lightsData = await getAllLights();
      setSavedLights(lightsData);
    };
    fetchLights();
  }, []);

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
    }
    setSelectedLightSetup(selectedId);
  };

  const handleUpdate = async () => {
    if (selectedLightSetup) {
      const foundSelectedSetup = savedLights.find(
        (light) => light.id === selectedLightSetup
      );

      if (foundSelectedSetup) {
        const updatedName = prompt("Enter new name:", foundSelectedSetup.name);
        if (updatedName !== null) {
          await updateSavedLightSetup(
            selectedLightSetup,
            updatedName,
            lights
          );

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

  return (
    <div className="flex justify-center items-center w-full">
      <div className="flex justify-center items-center flex-col sm:flex-row bg-gray-100 p-2 rounded-lg shadow-lg m-2">
        <label htmlFor="lightsetups-dropdown" className="font-bold text-sm">
          LIGHT SETUPS:{" "}
        </label>
        <select
          id="lights-dropdown"
          value={selectedLightSetup || ""}
          onChange={handleSetupChange}
          disabled={isCycleRunning}
          className="ml-2 bg-gray-300 border border-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-56"
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
        <div className="flex flex-row mt-2 sm:mt-0">
          <button
            onClick={handleUpdate}
            className="ml-2 flex flex-row items-center"
          >
            <FaEdit className="mr-1" /> Update selected
          </button>
          <button
            onClick={handleDelete}
            className="ml-2 flex flex-row items-center"
          >
            <FaTrash className="mr-1" /> Delete
          </button>
          <button
            onClick={handleSave}
            className="ml-2 flex flex-row items-center"
          >
            <FaSave className="mr-1" />
            Save as new
          </button>
        </div>
      </div>
    </div>
  );
};

export default LightSetupSelector;
