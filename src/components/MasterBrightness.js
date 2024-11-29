import React, { useState } from "react";
import { useLightData } from "../contexts/lightsContext";

const MasterBrightnessController = ({
  lights,
  setLights,
  handleApplyChanges,
  isCycleRunning,
}) => {
  const {
    masterBrightness,
    setMasterBrightness,
    isMasterBrightnessEnabled,
    setIsMasterBrightnessEnabled,
  } = useLightData();
  const [originalIntensity, setOriginalIntensity] = useState([]);

  const toggleMasterBrightness = async (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      const original = lights.map((light) => ({
        id: light.id,
        intensity: light.intensity,
      }));
      setOriginalIntensity(original);
    } else {
      const restoredLights = lights.map((light) => {
        const original = originalIntensity.find((orig) => orig.id === light.id);
        return {
          ...light,
          intensity: original ? original.intensity : light.intensity,
        };
      });

      setLights(restoredLights);
      setOriginalIntensity([]);

      try {
        await handleApplyChanges(
          "http://localhost:5000/set-brightness",
          restoredLights
        );
      } catch (error) {
        console.error("Error restoring brightness on backend:", error);
      }
    }

    setIsMasterBrightnessEnabled(isChecked);
  };

  const handleMasterBrightnessChange = async (e) => {
    const brightness = parseInt(e.target.value, 10);
    setMasterBrightness(brightness);

    if (isMasterBrightnessEnabled) {
      const adjustedLights = lights.map((light) => {
        const scaledIntensity = brightness;

        return {
          ...light,
          intensity: scaledIntensity,
        };
      });

      setLights(adjustedLights);

      try {
        await handleApplyChanges(
          "http://localhost:5000/set-brightness",
          adjustedLights
        );
      } catch (error) {
        console.error("Error applying brightness changes to backend:", error);
      }
    }
  };

  return (
    <div className="master-brightness-container flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-lg m-6 w-32 justify-between absolute top-1/3 left-1 md:left-36 transform -translate-y-1/2">
      <div className="flex flex-col items-center mb-20">
        <input
          type="checkbox"
          id="masterBrightnessToggle"
          checked={isMasterBrightnessEnabled}
          onChange={toggleMasterBrightness}
          className="form-checkbox h-5 w-5 text-green-500 focus:ring-2 focus:ring-green-300"
          disabled={isCycleRunning}
        />
        <label
          htmlFor="masterBrightnessToggle"
          className="font-semibold text-gray-700 text-center mt-2 text-sm"
        >
          MASTER BRIGHTNESS
        </label>
      </div>
      <div className="relative flex flex-col items-center justify-center h-full">
        <label
          htmlFor="masterBrightnessSlider"
          className="mb-6 text-gray-700 font-bold text-center hidden"
        >
          Master Brightness
        </label>
        <div className="relative flex flex-col items-center h-full group">
          <div
            className={`absolute top-[-2.5rem] bg-gray-800 text-white text-sm rounded-md px-2 py-1 opacity-0 transition-opacity duration-300 shadow-lg group-hover:opacity-90 z-50 ${
              isCycleRunning ? "" : "hidden"
            }`}
          >
            Stop cycle to adjust master brightness
          </div>
          <input
            type="range"
            id="masterBrightnessSlider"
            min="0"
            max="100"
            value={masterBrightness}
            onChange={handleMasterBrightnessChange}
            className={`w-40 h-2 bg-gray-300 rounded-lg appearance-none transform -rotate-90 origin-center focus:outline-none focus:ring-2 focus:ring-green-300 ${
              isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isMasterBrightnessEnabled || isCycleRunning}
          />
          <span
            className={`mt-20 text-lg font-semibold ${
              isMasterBrightnessEnabled ? "text-gray-700" : "text-gray-400"
            }`}
          >
            {masterBrightness}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MasterBrightnessController;
