import React, { useState } from "react";
import './lightGrid.css';

const LightGrid = ({ onLightSelect }) => {
    const [lights, setLights] = useState([
        { id: 1, selected: false, color: '#fff' },  
        { id: 2, selected: false, color: '#fff' }, 
        { id: 3, selected: false, color: '#fff' }, 
        { id: 4, selected: false, color: '#fff' },  
        { id: 5, selected: false, color: '#fff' }, 
        { id: 6, selected: false, color: '#fff' }, 
        { id: 7, selected: false, color: '#fff' },
        { id: 8, selected: false, color: '#fff' },  
        { id: 9, selected: false, color: '#fff' },  
        { id: 10, selected: false, color: '#fff' }, 
        { id: 11, selected: false, color: '#fff' },
        { id: 12, selected: false, color: '#fff' }
        ]);
    const [color, setColor] = useState("#ffffff");

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
