import React, { createContext, useState, useContext } from "react";

export const LightsContext = createContext();

const LightsProvider = ({ children }) => {
  const [selectedLightSetuppi, setSelectedLightSetuppi] = useState(null);
  const [selectedScenes, setSelectedScene] = useState([]);

  return (
    <LightsContext.Provider
      value={{ selectedLightSetuppi, setSelectedLightSetuppi, selectedScenes, setSelectedScene }}
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