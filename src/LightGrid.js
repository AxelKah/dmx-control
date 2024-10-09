import React, { useState } from "react";
import './lightGrid.css';

const LightGrid = ({ onLightSelect }) => {
    const [lights, setLights] = useState([
        { id: 1, position: [0, 0], selected: false, color: '#fff' },
        { id: 2, position: [0, 1], selected: false, color: '#fff' },
        { id: 3, position: [1, 0], selected: false, color: '#fff' },
        { id: 4, position: [1, 1], selected: false, color: '#fff' },
        { id: 5, position: [2, 0], selected: false, color: '#fff' },
        ]);

    const handleClick = (clickedLight) => {
        setLights(lights.map(light => 
            light.id === clickedLight.id 
                ? { ...light, selected: !light.selected, color: light.selected ? '#fff' : '#f00' } 
                : light
        ));
        onLightSelect(clickedLight);
    };

    return (
        <div className="grid-container">
            {lights.map((light) => (
                <div
                    key={light.id}
                    className={`light ${light.selected ? 'selected' : ''}`}
                    style={{ backgroundColor: light.color }}
                    onClick={() => handleClick(light)}
                >
                    {`Light ${light.id}`}
                </div>
            ))}
        </div>
    );
};

export default LightGrid;
