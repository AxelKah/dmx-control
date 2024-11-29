import React, { useState, useRef, useEffect } from "react";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import { makeApiCall } from "../utils/utils";
import { saveScenes, getScenes, deleteScene } from "../api/dmxApi";
import { useLightData } from "../contexts/lightsContext";

const SceneControls = ({
  lights,
  setLights,
  isCycleRunning,
  apiUrl = "http://localhost:5000/set-scene",
}) => {
  const {
    scenes,
    setScenes,
    selectedScenes,
    setSelectedScenes,
    selectedLightSetup,
    masterBrightness,
    isMasterBrightnessEnabled,
  } = useLightData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownToggleRef = useRef(null);

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

    fetchSetupsScenes();

    //reset selected scenes if setup changes
    setSelectedScenes([]);
  }, [selectedLightSetup, setScenes, setSelectedScenes]);

  useEffect(() => {
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

  const handleSceneSelection = async (scene) => {
    const updatedLights = lights.map((light) => {
      const matchingColor = scene.colors.find(
        (color) => color.lightId === light.id
      );
      if (matchingColor) {
        return {
          ...light,
          color: matchingColor.color,
          intensity: isMasterBrightnessEnabled
            ? masterBrightness
            : matchingColor.intensity
        };
      }
      return light;
    });

    setLights(updatedLights);
    setSelectedScenes([scene]);

    try {
      await makeApiCall(apiUrl, updatedLights);
    } catch (error) {
      console.error("Error applying scene:", error);
    }

    setIsOpen(false);
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
        channel: light.channel,
        intensity: light.intensity,
        startAddress: light.startAddress,
      })),
    };
    setScenes([...scenes, scene]);
    saveScenes(scene);
  };

  const deleteCurrentScene = () => {
    if (selectedScenes.length === 0) {
      alert("No scene selected to delete. Please select a scene first.");
      return;
    }

    const sceneToDelete = selectedScenes[0]; // remove only the one that currently shows as selected
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the scene "${sceneToDelete.name}"?`
    );

    if (!confirmDelete) {
      return; // clicked cancel
    }

    setScenes((prevScenes) =>
      prevScenes.filter((scene) => scene.id !== sceneToDelete.id)
    );
    setSelectedScenes([]);

    deleteScene(sceneToDelete.id); // backend delete
  };

  const resetLights = async () => {
    const resetColor = "#ffffff";
    const resetIntensity = 1;

    const resetLightsArray = lights.map((light) => ({
      ...light,
      color: resetColor,
      intensity: resetIntensity,
    }));

    setLights(resetLightsArray);
    setSelectedScenes([]);

    await makeApiCall("http://localhost:5000/set-lights", resetLightsArray);
  };

  return (
    <div className="relative flex flex-row" ref={dropdownToggleRef}>
      <div
        className={`flex flex-row items-center border rounded-xl border-gray-300 bg-gray-200 px-4 py-2 pr-4 text-gray-700 cursor-pointer focus:border-blue-500 focus:outline-none w-40 h-11 overflow-hidden ${
          isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate">
          {selectedScenes.length > 0 ? selectedScenes[0].name : "Select scene"}
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
                  handleSceneSelection(scene);
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
      <div className="flex flex-row">
        <button
          onClick={saveCurrentScene}
          disabled={isCycleRunning}
          className={`flex flex-row mx-2 ${
            isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Save scene
        </button>
        <button
          onClick={() => deleteCurrentScene(selectedScenes?.id)}
          disabled={isCycleRunning}
          className={`flex flex-row ${
            isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Delete scene
        </button>
        <button
          onClick={resetLights}
          disabled={isCycleRunning}
          className={`ml-2 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 ${
            isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Reset lights
        </button>
      </div>
    </div>
  );
};

export default SceneControls;
