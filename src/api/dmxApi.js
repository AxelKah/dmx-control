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
