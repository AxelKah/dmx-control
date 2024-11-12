const express = require("express");
const DMX = require("dmx");

const router = express.Router();

// Initialize the controller
const dmx = new DMX();

const universe = dmx.addUniverse("demo", "enttec-open-usb-dmx", "COM9");


// Helper function to convert hex color to RGB
const hexToRgb = (hex) => {
  const red = parseInt(hex.substr(1, 2), 16);
  const green = parseInt(hex.substr(3, 2), 16);
  const blue = parseInt(hex.substr(5, 2), 16);
  return { red, green, blue };
};


// Endpoint to set a DMX channel value
router.post("/set-channel", (req, res) => {
  const { channel, value } = req.body;

  if (value < 0 || value > 255) {
    return res.status(400).send("Value must be between 0 and 255.");
  }

  // Update light channel and value 0-255
  universe.update({
    [channel]: value,
  });

  console.log(`DMX Channel ${channel} set to ${value}`);
  res.send(`Channel ${channel} set to ${value}`);
});

let intervalId = null;
// Route to start the rainbow effect
router.post("/start-rainbow", (req, res) => {
  let hue = 0;
  // Interval time in milliseconds, smaller values will make the effect faster
  const intervalTime = 10;

  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => {
    hue = (hue + 1) % 360;
    const rgb = hslToRgb(hue / 360, 1, 0.5);

    universe.update({
      1: rgb[0], // Red channel
      2: rgb[1], // Green channel
      3: rgb[2], // Blue channel
    });

    console.log(`Hue: ${hue}, RGB: ${rgb}`);
  }, intervalTime);

  res.send("Rainbow effect started");
});
// Route to stop the rainbow effect
router.post("/stop-rainbow", (req, res) => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    universe.update({
      1: 0, // Red channel
      2: 0, // Green channel
      3: 0, // Blue channel
    });
    res.send("Rainbow effect stopped");
  } else {
    res.send("No rainbow effect to stop");
  }
});

let policeIntervalId = null;

// Route to start the police lights effect
router.post("/start-police-lights", (req, res) => {
  const intervalTime = 250;
  let isRed = true;

  // Clear any previous intervals
  if (policeIntervalId) {
    clearInterval(policeIntervalId);
  }

  policeIntervalId = setInterval(() => {
    if (isRed) {
      universe.update({
        1: 255, // Red channel
        2: 0, // Green channel
        3: 0, // Blue channel
      });
    } else {
      universe.update({
        1: 0, // Red channel
        2: 0, // Green channel
        3: 255, // Blue channel
      });
    }

    isRed = !isRed; // Toggle between red and blue
  }, intervalTime);

  res.send("Police lights effect started");
});

// Route to stop the police lights effect
router.post("/stop-police-lights", (req, res) => {
  if (policeIntervalId) {
    clearInterval(policeIntervalId);
    policeIntervalId = null;

    // Turn off the lights
    universe.update({
      1: 0, // Red channel
      2: 0, // Green channel
      3: 0, // Blue channel
    });

    res.send("Police lights effect stopped");
  } else {
    res.send("No police lights effect to stop");
  }
});

// Route to clear all lights and stop all effects
router.post("/clear-lights", (req, res) => {
  // Create an object to set all channels to 0
  const clearChannels = {};
  for (let i = 1; i <= 512; i++) {
    clearChannels[i] = 0;
  }
  console.log("Clearing all lights and stopping effects");
  universe.update(clearChannels);

  // Stop rainbow effect if running
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Stop police lights effect if running
  if (policeIntervalId) {
    clearInterval(policeIntervalId);
    policeIntervalId = null;
  }

  res.send("All lights cleared and effects stopped");
});


// Route to set brightness
router.post('/set-brightness', (req, res) => {
  const lights = req.body.lights;
  console.log(lights);
  if (!Array.isArray(lights)) {
    return res.status(400).send('Lights should be an array of objects with id and intensity properties.');
  }

  lights.forEach(light => {
    const { startAddress, intensity } = light;
    console.log(`Setting light at start address ${startAddress} to brightness ${intensity}`);

    // Map the light StartAddress to its DMX channel
    const dmxChannel = startAddress;

    const startValues = {
      red: universe.get(dmxChannel),
      green: universe.get(dmxChannel + 1),
      blue: universe.get(dmxChannel + 2),
    };

    const endValues = {
      red: (startValues.red / 255) * (intensity / 100) * 255,
      green: (startValues.green / 255) * (intensity / 100) * 255,
      blue: (startValues.blue / 255) * (intensity / 100) * 255,
    };

    updateDmxSmoothly(startValues, endValues, 2000, (currentValues) => {
      universe.update({
        [dmxChannel]: currentValues.red,
        [dmxChannel + 1]: currentValues.green,
        [dmxChannel + 2]: currentValues.blue,
      });
    });
  });

  res.send({ success: true });
});



// Helper function to update DMX values smoothly
const updateDmxSmoothly = (startValues, endValues, duration, updateFn) => {
  const steps = 30;
  const stepDuration = duration / steps;
  const stepValues = {
    red: (endValues.red - startValues.red) / steps,
    green: (endValues.green - startValues.green) / steps,
    blue: (endValues.blue - startValues.blue) / steps,
  };

  let currentStep = 0;

  const interval = setInterval(() => {
    if (currentStep >= steps) {
      clearInterval(interval);
      return;
    }

    const currentValues = {
      red: startValues.red + stepValues.red * currentStep,
      green: startValues.green + stepValues.green * currentStep,
      blue: startValues.blue + stepValues.blue * currentStep,
    };

    updateFn(currentValues);
    currentStep++;
  }, stepDuration);
};

// Route to set a scene
router.post('/set-scene', (req, res) => {
  const { lights } = req.body;

  lights.forEach((light) => {
    const { startAddress, color, intensity } = light;
    const dmxChannel = startAddress;
    const { red, green, blue } = hexToRgb(color);

    const startValues = {
      red: universe.get(dmxChannel),
      green: universe.get(dmxChannel + 1),
      blue: universe.get(dmxChannel + 2),
    };

    const endValues = {
      red: red * intensity / 100,
      green: green * intensity / 100,
      blue: blue * intensity / 100,
    };

    updateDmxSmoothly(startValues, endValues, 2000, (currentValues) => {
      universe.update({
        [dmxChannel]: currentValues.red,
        [dmxChannel + 1]: currentValues.green,
        [dmxChannel + 2]: currentValues.blue,
      });
    });
  });

  res.send({ success: true });
});




/*
// Route to log all lights and their channels
app.post('/log-lights', (req, res) => {
    const channels = universe.getChannels();
    console.log('Current light channels and values:');
    for (let channel in channels) {
        console.log(`Channel ${channel}: ${channels[channel]}`);
    }
    res.send({ success: true });
});
*/
// Control multiple lights
router.post("/set-lights", (req, res) => {
  const lights = req.body.lights;
  console.log(lights);
  if (!Array.isArray(lights)) {
    return res
      .status(400)
      .send(
        "Lights should be an array of objects with id and color properties."
      );
  }

  lights.forEach((light) => {
    const { id, channel, color, startAddress } = light;
    console.log(`Setting light ${id} channel ${channel} to color ${color}`);

    // Map the light StartAddress to its DMX channel
    const dmxChannel = startAddress;

    // Convert the color to DMX values (RGB)
    const red = parseInt(color.substr(1, 2), 16);
    const green = parseInt(color.substr(3, 2), 16);
    const blue = parseInt(color.substr(5, 2), 16);

    // Set the DMX channels for the light
    universe.update({
      [dmxChannel]: red, // Red channel
      [dmxChannel + 1]: green, // Green channel
      [dmxChannel + 2]: blue, // Blue channel
    });
  });

  res.send({ success: true });
});

let currentChannel = 1;

// Test one DMX channel at a time
router.post("/test-channels", (req, res) => {
  if (currentChannel > 512) {
    currentChannel = 1; // Reset to the first channel if all channels have been tested
  }

  // Turn off the previous channel
  if (currentChannel > 1) {
    universe.update({
      [currentChannel - 1]: 0,
    });
  }

  // Test the current channel
  console.log(`Testing channel ${currentChannel}`);
  universe.update({
    [currentChannel]: 255,
  });

  res.send(`Testing channel ${currentChannel}`);
  currentChannel++;
});

//Convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; //achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

module.exports = router;
