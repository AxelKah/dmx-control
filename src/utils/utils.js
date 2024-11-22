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
    else {
      console.log("selectedLights", selectedLights);

      console.log("No lights selected");
    }
  };


  // Helper function to make an API call to set the cycle effect
  export const makeCycleApiCall = async (url, lightsArray1, lightsArray2, interval) => {
    if (!Array.isArray(lightsArray1.lightsArray1) || !Array.isArray(lightsArray1.lightsArray2)) {
      console.log("lightsArray1asdsads:", lightsArray1.lightsArray1);
      console.log("lightsArray2:",lightsArray1.lightsArray2);
      return;
    }
    try {
      console.log("kerrant täällää")
      console.log(interval + "interval")
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lightsArray1: lightsArray1.lightsArray1.map((light) => ({
            id: light.id,
            color: light.color,
            channel: light.channel,
            startAddress: light.startAddress,
            intensity: light.intensity,
          })),
          lightsArray2: lightsArray1.lightsArray2.map((light) => ({
            id: light.id,
            color: light.color,
            channel: light.channel,
            startAddress: light.startAddress,
            intensity: light.intensity,
          })),
          interval,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error making API call:", error);
    }
  };