const express = require('express');
const cors = require('cors');
const DMX = require('dmx');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the controller
const dmx = new DMX();

const universe = dmx.addUniverse('demo', 'enttec-open-usb-dmx', 'COM9');

// Endpoint to set a DMX channel value
app.post('/set-channel', (req, res) => {
    const { channel, value } = req.body;

    if (value < 0 || value > 255) {
        return res.status(400).send('Value must be between 0 and 255.');
    }

    // Update light channel and value 0-255
    universe.update({
        [channel]: value
    });

    console.log(`DMX Channel ${channel} set to ${value}`);
    res.send(`Channel ${channel} set to ${value}`);
});

let intervalId = null;

app.post('/start-rainbow', (req, res) => {
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
            1: rgb[0],  // Red channel
            2: rgb[1],  // Green channel
            3: rgb[2]   // Blue channel
        });

        console.log(`Hue: ${hue}, RGB: ${rgb}`);
    }, intervalTime);

    res.send('Rainbow effect started');
});

app.post('/stop-rainbow', (req, res) => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
                universe.update({
                    1: 0,  // Red channel
                    2: 0,  // Green channel
                    3: 0  // Blue channel
                });
        res.send('Rainbow effect stopped');
    } else {
        res.send('No rainbow effect to stop');
    }
});


let policeIntervalId = null;

// Route to start the police lights effect
app.post('/start-police-lights', (req, res) => {
    const intervalTime = 250;
    let isRed = true;

    // Clear any previous intervals
    if (policeIntervalId) {
        clearInterval(policeIntervalId);
    }

    policeIntervalId = setInterval(() => {
        if (isRed) {
            universe.update({
                1: 255,  // Red channel
                2: 0,    // Green channel
                3: 0     // Blue channel
            });
        } else {
            universe.update({
                1: 0,    // Red channel
                2: 0,    // Green channel
                3: 255   // Blue channel
            });
        }

        isRed = !isRed; // Toggle between red and blue
    }, intervalTime);

    res.send('Police lights effect started');
});

// Route to stop the police lights effect
app.post('/stop-police-lights', (req, res) => {
    if (policeIntervalId) {
        clearInterval(policeIntervalId);
        policeIntervalId = null;

        // Turn off the lights
        universe.update({
            1: 0,  // Red channel
            2: 0,  // Green channel
            3: 0   // Blue channel
        });

        res.send('Police lights effect stopped');
    } else {
        res.send('No police lights effect to stop');
    }
});

// Route to clear all lights and stop all effects
app.post('/clear-lights', (req, res) => {
    universe.update({
        1: 0,
        2: 0,
        3: 0
    });

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

    res.send('All lights cleared and effects stopped');
});




// Control individual lights 
app.post('/set-light', (req, res) => {
    const { id, color } = req.body;

    // Map the light ID to its DMX channel
    const dmxChannel = id;

    // Convert the color to DMX values (RGB)
    const red = parseInt(color.substr(1, 2), 16);
    const green = parseInt(color.substr(3, 2), 16);
    const blue = parseInt(color.substr(5, 2), 16);

    // Set the DMX channels for the light
    universe.update({
        [dmxChannel]: red,      // Red channel
        [dmxChannel + 1]: green, // Green channel
        [dmxChannel + 2]: blue   // Blue channel
    });

    res.send({ success: true });
});

// Test all DMX channels
app.post('/test-channels', (req, res) => {
    let channel = 1;

    const interval = setInterval(() => {
        if (channel > 512) {
            clearInterval(interval);
            setTimeout(() => {
                for (let i = 1; i <= 512; i++) {
                    console.log(`Turning off channel ${i}`);
                    universe.update({
                        [i]: 0
                    });
                }
            }, 1000);
            return;
        }

        console.log(`Testing channel ${channel}`);
        universe.update({
            [channel]: 255
        });

        channel++;
    }, 1000);

    setTimeout(() => {
        for (let i = 1; i <= 512; i++) {
            console.log(`Turning off channel ${i}`);
            universe.update({
                [i]: 0
            });
        }
    }, 1000);

    res.send('Testing all DMX channels');
});



//Convert HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
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

// Start the server
app.listen(port, () => {
    console.log(`DMX controller running at http://localhost:${port}`);
});
