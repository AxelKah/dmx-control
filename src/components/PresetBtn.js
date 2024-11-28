import React from 'react';
import { makeApiCall } from '../utils/utils';
import '../PresetBtn.css';
import { PresetScene1, PresetScene2 } from './PresetScene';

const PresetBtn = ({ lights, startCycle, startCycle1h}) => {


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
    

    return (
        <div className="button-container">
            <button className="preset-button" onClick={whiteLights}>White Light</button>
            <button className="preset-button" onClick={purpleLight}>Purple Light</button>
            <button className="preset-button" onClick={PresetScenes}>Purple & Green cycle 15min</button>
            <button className="preset-button" onClick={PresetScenes1h}>Purple & Green cycle 1h</button>
            <button className="preset-button" onClick={greenLights}>Green Light</button>

        
        </div>
    );
};

export default PresetBtn;