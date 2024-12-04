import React, { useState, useRef } from "react";
import { FaAngleUp, FaAngleDown, FaRotate } from "react-icons/fa6";
import SceneList from "./SceneList";
import { makeCycleApiCall, makeApiCall } from "../utils/utils";
import { useLightData } from "../contexts/lightsContext";

const SceneCycler = ({
  lights,
  setLights,
  masterBrightness,
  isMasterBrightnessEnabled,
}) => {
  const { setSelectedScenes, setIsCycleRunning } = useLightData();
  const [cycleInterval, setCycleInterval] = useState(null);
  const [showSceneDropdown, setShowSceneDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const startSceneCycle = async (selectedScenes, interval) => {
    if (cycleInterval) {
      clearInterval(cycleInterval);
    }

    if (!Array.isArray(selectedScenes) || selectedScenes.length < 2) {
      alert("Please select at least two scenes.");
      return;
    }

    if (!selectedScenes.every((scene) => Array.isArray(scene.colors))) {
      console.error(
        "One or more selected scenes are missing 'colors': ",
        selectedScenes
      );
      alert("Selected scenes must have light configurations.");
      return;
    }

    try {
      // to apply master brightness if enabled
      const adjustBrightness = (colors) =>
        colors.map((color) => ({
          ...color,
          intensity: isMasterBrightnessEnabled
            ? masterBrightness
            : color.intensity,
        }));

      const transformLights = (colors) =>
        colors.map((light) => ({
          id: light.lightId,
          color: light.color,
          channel: light.channel,
          startAddress: light.startAddress,
          intensity: light.intensity,
        }));

      const sceneLightsArrays = selectedScenes.map((scene) =>
        transformLights(adjustBrightness(scene.colors))
      );

      setIsCycleRunning(true);

      await makeCycleApiCall(
        "http://localhost:5000/set-cycle",
        sceneLightsArrays,
        interval
      );

      let currentIndex = 0;

      const updateLightsState = () => {
        const currentSceneLights = sceneLightsArrays[currentIndex];
        const currentScene = selectedScenes[currentIndex];

        if (currentSceneLights) {
          const updatedLights = lights.map((existingLight) => {
            const matchingColor = currentSceneLights.find(
              (color) => color.id === existingLight.id
            );

            if (matchingColor) {
              return {
                ...existingLight,
                color: matchingColor.color,
                intensity: matchingColor.intensity,
                selected: false,
              };
            }

            return {
              ...existingLight,
              selected: false,
            };
          });

          setLights(updatedLights);
          setSelectedScenes([currentScene]);
        }

        currentIndex = (currentIndex + 1) % sceneLightsArrays.length;
      };

      if (cycleInterval) clearInterval(cycleInterval);

      updateLightsState();

      const intervalId = setInterval(updateLightsState, interval);
      setCycleInterval(intervalId);
    } catch (error) {
      console.error("Failed to start scene cycle:", error);
      alert("Failed to start scene cycle. Please try again.");
      setIsCycleRunning(false);
    }
  };

  const stopSceneCycle = async () => {
    // stop frontend updates
    if (cycleInterval) {
      clearInterval(cycleInterval);
      setCycleInterval(null);
    }

    // stop backend updates
    try {
      await makeApiCall("http://localhost:5000/stop-cycle", {});
    } catch (error) {
      console.error("Failed to stop scene cycle:", error);
    } finally {
      setIsCycleRunning(false);
    }
  };

  return (
    <div className="scene-cycler-container">
      <div className="relative">
        <button
          onClick={() => setShowSceneDropdown((prev) => !prev)}
          className="flex flex-row items-center border rounded-lg px-4 py-2"
        >
          <FaRotate className="mr-1" />
          Scene cycler
          <span className="ml-2">
            {showSceneDropdown ? <FaAngleUp /> : <FaAngleDown />}
          </span>
        </button>
        {showSceneDropdown && (
          <div
            ref={dropdownRef}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-fit p-2 bg-gray-300 border border-gray-400 shadow-lg rounded z-[100] min-w-72"
          >
            <SceneList
              startSceneCycle={startSceneCycle}
              stopSceneCycle={stopSceneCycle}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneCycler;
