import React, { useState } from "react";
import './lightGrid.css';

const LightGrid = ({ onLightSelect }) => {
    const [numLights, setNumLights] = useState(1); // Default to 11 lights
    const [lights, setLights] = useState(Array.from({ length: numLights }, (_, i) => ({
        id: i + 1,
        selected: false,
        color: '#fff',
        channel: i + 1 // Assigning channel value
    })));
    const [color, setColor] = useState("#ffffff");
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [newLightId, setNewLightId] = useState("");
    const [newLightChannels, setNewLightChannels] = useState("");

    const handleNumLightsChange = (e) => {
        const newNumLights = parseInt(e.target.value);
        setNumLights(newNumLights);
        setLights(Array.from({ length: newNumLights }, (_, i) => ({
            id: i + 1,
            selected: false,
            color: '#fff',
            channel: i + 1 // Assigning channel value
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
                body: JSON.stringify({ lights: selectedLights.map(light => ({ id: light.id, color, channel: light.channel })) }),
            });
        }
    };

    const handleAddLight = () => {
        const id = parseInt(prompt("Enter light ID:"));
        const channel = parseInt(prompt("Enter how many channels does the light have:"));
        if (!isNaN(id) && !isNaN(channel)) {
            const existingLight = lights.find(light => light.id === id);
            if (existingLight) {
                alert(`A light with ID ${id} already exists.`);
            } else {
                setLights([...lights, { id, selected: false, color: '#fff', channel }]);
            }
        }
    };


    const openModal = () => {
        setShowModal(true);
    };

    // Handle the form submission inside the modal
    const handleModalSubmit = () => {
        const id = parseInt(newLightId);
        const channel = parseInt(newLightChannels);
        if (!isNaN(id) && !isNaN(channel)) {
            const existingLight = lights.find(light => light.id === id);
            if (existingLight) {
                alert(`A light with ID ${id} already exists.`);
            } else {
                setLights([...lights, { id, selected: false, color: '#fff', channel }]);
                setShowModal(false); // Close the modal after submission
            }
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
                <button onClick={handleAddLight} style={{ marginLeft: '10px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    Add Light
                </button>
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
            
             {/* Button to open the modal */}
                <button onClick={openModal} style={{ marginLeft: '10px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                Add new light
                </button>
             {/* Modal to input new light information */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Add New Light</h2>
                        <label>
                            Light ID:
                            <input 
                                type="number" 
                                value={newLightId} 
                                onChange={(e) => setNewLightId(e.target.value)} 
                            />
                        </label>
                        <br />
                        <label>
                            Number of Channels:
                            <input 
                                type="number" 
                                value={newLightChannels} 
                                onChange={(e) => setNewLightChannels(e.target.value)} 
                            />
                        </label>
                        <br />
                        <button onClick={handleModalSubmit}>Submit</button>
                        <button onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default LightGrid;
