import React, { createContext, useState, useContext } from "react";

export const LightsContext = createContext();

const LightsProvider = ({ children }) => {
  const [selectedLightSetup, setSelectedLightSetup] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [selectedScenes, setSelectedScenes] = useState([]);
  const [isCycleRunning, setIsCycleRunning] = useState(false);

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
