import React, { useState, useRef } from "react";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
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

    if (!Array.isArray(selectedScenes) || selectedScenes.length !== 2) {
      alert("Please select exactly two scenes.");
      return;
    }

    const [scene1, scene2] = selectedScenes;

    if (!Array.isArray(scene1.colors) || !Array.isArray(scene2.colors)) {
      console.error(
        "One or both selected scenes are missing 'colors': ",
        scene1,
        scene2
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

      const sceneLightsArrays = [
        transformLights(adjustBrightness(scene1.colors)),
        transformLights(adjustBrightness(scene2.colors)),
      ];

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
          className="flex items-center border rounded-lg px-4 py-2 shadow"
        >
          <span>Scene cycler</span>
          <span className="ml-2">
            {showSceneDropdown ? <FaAngleUp /> : <FaAngleDown />}
          </span>
        </button>
        {showSceneDropdown && (
          <div
            ref={dropdownRef}
            className="absolute bottom-full left-0 mb-2 w-fit p-2 bg-gray-300 border border-gray-400 shadow-lg rounded z-10 min-w-64"
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
