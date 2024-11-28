export const startRainbow = async () => {
  const response = await fetch("http://localhost:5000/start-rainbow", {
    method: "POST",
  });

  if (response.ok) {
    console.log("Rainbow effect started");
  }
};

export const stopRainbow = async () => {
  const response = await fetch("http://localhost:5000/stop-rainbow", {
    method: "POST",
  });

  if (response.ok) {
    console.log("Rainbow effect stopped");
  }
};

export const startPoliceLights = async () => {
  await fetch("http://localhost:5000/start-police-lights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const stopPoliceLights = async () => {
  await fetch("http://localhost:5000/stop-police-lights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const testChannels = async () => {
  await fetch("http://localhost:5000/test-channels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const saveLights = async (name, lights) => {
  try {

    // remove selected value and change color to default white
    const filteredLights = lights.map(({ selected, ...rest }) => rest);
    filteredLights.forEach(element => {
      element.color = '#ffffff';
    });

    const response = await fetch("http://localhost:5000/save-lights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        lights: filteredLights,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error! HTTP status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error making API call:", error);
  }
};

export const updateSavedLightSetup = async (id, updatedName, updatedLights) => {
  try {
    // remove selected value and change color to default white
    const filteredUpdatedLights = updatedLights.map(
      ({ selected, ...rest }) => rest
    );
    filteredUpdatedLights.forEach((element) => {
      element.color = "#ffffff";
    });

    const response = await fetch("http://localhost:5000/update-saved-lights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        name: updatedName,
        lights: filteredUpdatedLights,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP status:  ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating lights:", error);
  }
};

export const deleteSavedLightSetup = async (id) => {
  try {
    const response = await fetch("http://localhost:5000/delete-saved-lights", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting:", error);
  }
};

export const getAllLights = async () => {
  try {
    const response = await fetch("http://localhost:5000/get-saved-lights", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP status:  ${response.status}`);
    }

    const lights = await response.json();
    return lights;
  } catch (error) {
    console.error("Error fetching lights:", error);
    return [];
  }
};

export const saveScenes = async (scene) => {
  try {
    const response = await fetch("http://localhost:5000/create-scene", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scene),
    });

    if (!response.ok) {
      throw new Error(`Error! HTTP status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error in saveScenes:", error);
  }
};

export const deleteScene = async (sceneId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/delete-scene/${sceneId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error! HTTP status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error in deleteScene:", error);
  }
};

export const getScenes = async (lightSetupId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/get-saved-scenes/${lightSetupId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP status:  ${response.status}`);
    }

    const scenes = await response.json();
    return scenes;
  } catch (error) {
    console.error("Error in getScenes:", error);
    return [];
  }
};