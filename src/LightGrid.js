import React, { useState } from "react";
import './lightGrid.css';

const LightGrid = ({ onLightSelect }) => {
    const [numLights, setNumLights] = useState(11); // Default to 11 lights
    const [lights, setLights] = useState(Array.from({ length: numLights }, (_, i) => ({
        id: i + 1,
        selected: false,
        color: '#fff'
    })));
    const [color, setColor] = useState("#ffffff");

    const handleNumLightsChange = (e) => {
        const newNumLights = parseInt(e.target.value);
        setNumLights(newNumLights);
        setLights(Array.from({ length: newNumLights }, (_, i) => ({
            id: i + 1,
            selected: false,
            color: '#fff'
        })));
    };

    const handleClick = (clickedLight) => {
        setLights(lights.map(light =>
            light.id === clickedLight.id
                ? { ...light, selected: !light.selected, color: light.selected ? '#fff' : '#f00' }
                : light
        ));
        onLightSelect(clickedLight);
    };

    const handleColorChange = (e) => {
        setColor(e.target.value);
    };

    const handleApplyColor = async () => {
        const selectedLights = lights.filter(light => light.selected);
        if (selectedLights.length > 0) {
            await fetch("http://localhost:5000/set-lights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lights: selectedLights.map(light => ({ id: light.id, color })) }),
            });
        }
    };

    return (
        <div>
            <div>
                <label>
                    Number of Light Fixtures:
                    <input
                        type="number"
                        value={numLights}
                        onChange={handleNumLightsChange}
                        min="1"
                        style={{ marginLeft: '10px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </label>
            </div>
            <div className="grid-container">
                {lights.map((light) => (
                    <div
                        key={light.id}
                        className={`light ${light.selected ? 'selected' : ''}`}
                        style={{ backgroundColor: light.color }}
                        onClick={() => handleClick(light)}
                    >
                        {`Light address ${light.id}`}
                    </div>
                ))}
            </div>
            <input type="color" value={color} onChange={handleColorChange} />
            <button onClick={handleApplyColor}>Apply Color</button>
        </div>
    );
};

export default LightGrid;
