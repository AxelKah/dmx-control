import React from 'react';
import { makeApiCall } from '../utils/utils';
import '../PresetBtn.css';
import { PresetScene1, PresetScene2 } from './PresetScene';

const PresetBtn = ({ lights, startCycle, startCycle1h, killLights, startCycle25sec}) => {


    const purpleLight = async () => {
        lights.forEach(light => {
            light.color = "#BF40BF";
        });
        await makeApiCall("http://localhost:5000/set-lights", lights);
    }

    const whiteLights = async () => {
        lights.forEach(light => {
            light.color = "#ffffff";
        });
        await makeApiCall("http://localhost:5000/set-lights", lights);
    }

    const greenLights = async () => {
        lights.forEach(light => {
            light.color = "#00FF00";
        });
        await makeApiCall("http://localhost:5000/set-lights", lights);
    };
    const PresetScenes = async () => {
        await startCycle(PresetScene1, PresetScene2, 900000);
      };
      const PresetScenes1h = async () => {
        await startCycle1h(PresetScene1, PresetScene2, 900000);
      };
      const PresetScenes25 = async () => {
        await startCycle25sec(PresetScene1, PresetScene2, 25000);
      };

      const stopCycle = async () => {
        await makeApiCall("http://localhost:5000/stop-cycle", [0]);
    };

    const dimLights = async () => {
        await killLights();
    };

    

    return (
        <div className="button-container">
            <button className="preset-button" onClick={whiteLights}>White Light</button>
            <button className="preset-button" onClick={purpleLight}>Purple Light</button>
            <button className="preset-button" onClick={greenLights}>Green Light</button>
            <button className="preset-button" onClick={PresetScenes}>Purple & Green cycle 15min</button>
            <button className="preset-button" onClick={PresetScenes1h}>Purple & Green cycle 1h</button>
            <button className="preset-button" onClick={PresetScenes25}>Purple & Green cycle 25seconds</button>
           <br/>
           <br/>
            <button className="preset-button" onClick={stopCycle}>Stop Cycle</button>
            <button className="preset-button" onClick={dimLights}>Stop Lights</button>
        
        </div>
    );
};

export default PresetBtn;