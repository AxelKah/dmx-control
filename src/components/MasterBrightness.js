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
    <div className="master-brightness-container flex flex-col sm:flex-row 2xl:flex-col items-center bg-gray-100 2xl:p-6 rounded-xl shadow-lg p-4 m-6 w-auto justify-between 2xl:absolute top-1/3 left-0 2xl:left-32 transform 2xl:-translate-y-1/4 2xl:h-80 2xl:w-32">
      {/* toggle */}
      <div className="flex flex-row 2xl:flex-col items-center sm:mr-6 2xl:mr-0 mb-6 sm:mb-0 2xl:mb-6 2xl:w-30">
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
          className="font-semibold text-gray-700 text-center text-xs lg:text-sm m-1"
        >
          MASTER BRIGHTNESS
        </label>
      </div>

      {/* slider */}
      <div className="relative flex items-center flex-row 2xl:flex-col justify-center w-full h-full sm:items-center 2xl:items-center">
        <label
          htmlFor="masterBrightnessSlider"
          className="mb-6 sm:mb-0 2xl:mb-6 text-gray-700 font-bold text-center hidden"
        >
          Master Brightness
        </label>
        <div className="relative flex flex-row 2xl:flex-col items-center h-full group w-full">
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
            className={`w-full 2xl:w-36 2xl:h-36 transform 2xl:-rotate-90 ${
              isCycleRunning ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isMasterBrightnessEnabled || isCycleRunning}
          />
          <span
            className={`mt-6 sm:mt-0 sm:ml-4 2xl:mt-6 2xl:ml-0 text-lg font-semibold ${
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
