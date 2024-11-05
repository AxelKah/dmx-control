import Light from "../models/Light";

// Helper function to add multiple lights to a specific container
export const addMultipleLights = (numLightsToAdd, containerId, currentId) => {
  const newLights = []; 
  for (let i = 0; i < numLightsToAdd; i++) {
    currentId++;
    newLights.push(new Light(currentId, 1, 0, "#fff", containerId, 99));
  }

  return { newLights, currentId };
};

// Helper function to update the selected lights
export const updateSelectedLights = (lights, updates) => {
    return lights.map((light) => (light.selected ? { ...light, ...updates } : light));
  };

// Helper function to make an API call to the server
export const makeApiCall = async (url, selectedLights) => {
    if (selectedLights.length > 0) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lights: selectedLights.map((light) => ({
              id: light.id,
              color: light.color,
              channel: light.channel,
              startAddress: light.startAddress,
              intensity: light.intensity,
            })),
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error making API call:", error);
      }
    }
  };