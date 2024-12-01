import React, { createContext, useState, useContext, useEffect } from "react";

export const LightsContext = createContext();

const LightsProvider = ({ children }) => {
  const initialState = JSON.parse(sessionStorage.getItem("lightsState")) || {
    selectedLightSetup: null,
    scenes: [],
    selectedScenes: [],
    isCycleRunning: false,
    masterBrightness: 100,
    isMasterBrightnessEnabled: false,
  };

  const [selectedLightSetup, setSelectedLightSetup] = useState(initialState.selectedLightSetup);
  const [scenes, setScenes] = useState(initialState.scenes);
  const [selectedScenes, setSelectedScenes] = useState(initialState.selectedScenes);
  const [isCycleRunning, setIsCycleRunning] = useState(initialState.isCycleRunning);
  const [masterBrightness, setMasterBrightness] = useState(initialState.masterBrightness);
  const [isMasterBrightnessEnabled, setIsMasterBrightnessEnabled] = useState(initialState.isMasterBrightnessEnabled);

  useEffect(() => {
    const state = {
      selectedLightSetup,
      scenes,
      selectedScenes,
      isCycleRunning,
      masterBrightness,
      isMasterBrightnessEnabled,
    };
    sessionStorage.setItem("lightsState", JSON.stringify(state));
  }, [
    selectedLightSetup,
    scenes,
    selectedScenes,
    isCycleRunning,
    masterBrightness,
    isMasterBrightnessEnabled,
  ]);

  return (
    <LightsContext.Provider
      value={{
        selectedLightSetup,
        setSelectedLightSetup,
        selectedScenes,
        setSelectedScenes,
        scenes,
        setScenes,
        isCycleRunning,
        setIsCycleRunning,
        masterBrightness,
        setMasterBrightness,
        isMasterBrightnessEnabled,
        setIsMasterBrightnessEnabled,
      }}
    >
      {children}
    </LightsContext.Provider>
  );
};

export const useLightData = () => {
  const context = useContext(LightsContext);
  if (!context) {
    throw new Error("LightsContext not found");
  }
  return context;
};

export default LightsProvider;
