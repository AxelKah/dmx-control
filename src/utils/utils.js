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
export const makeApiCall = async (url, receivedLights = []) => {
  try {
    const body =
      receivedLights.length > 0
        ? JSON.stringify({
            lights: receivedLights.map((light) => ({
              id: light.id,
              color: light.color,
              channel: light.channel,
              startAddress: light.startAddress,
              intensity: light.intensity,
            })),
          })
        : null;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...(body && { body }), // include the body only if not null
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error making API call:", error);
  }
};


  // Helper function to make an API call to set the cycle effect
  export const makeCycleApiCall = async (url, lightsArray, interval) => {
    if (
      !Array.isArray(lightsArray) ||
      lightsArray.some((subArray) => !Array.isArray(subArray))
    ) {
      console.error("lightsArray must be an array that has arrays");
      console.log("lightsArray:", lightsArray);
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lightsArray: lightsArray.map((subArray) =>
            subArray.map((light) => ({
              id: light.id,
              color: light.color,
              channel: light.channel,
              startAddress: light.startAddress,
              intensity: light.intensity,
            }))
          ),
          interval,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error making API call:", error);
      throw error;
    }
  };
  