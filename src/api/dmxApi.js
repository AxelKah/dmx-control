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
    const response = await fetch("http://localhost:5000/save-lights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        lights: lights,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error making API call:", error);
  }
};
