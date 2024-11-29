import React, { useState } from "react";
import { useLightData } from "../contexts/lightsContext";

const SceneList = ({ startSceneCycle, stopSceneCycle }) => {
  const { scenes, selectedScenes, setSelectedScenes } = useLightData();
  const [interval, setInterval] = useState(1);

  const handleSelect = (scene) => {
    if (selectedScenes.includes(scene)) {
      setSelectedScenes(selectedScenes.filter((i) => i !== scene));
    } else if (selectedScenes.length < 2) {
      setSelectedScenes([...selectedScenes, scene]);
    }
  };

  const handleSubmit = () => {
    if (selectedScenes.length === 2) {
      sendSelection(selectedScenes, interval);
    } else {
      alert("Please select two items.");
    }
  };

  const sendSelection = async (scenes, intervalInSeconds) => {
    const intervalInMilliseconds = intervalInSeconds * 1000;
    await startSceneCycle(scenes, intervalInMilliseconds);
  };

  return (
    <div>
      {scenes.length > 0 ? (
        <ul className="border rounded overflow-hidden">
          {scenes.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              style={{
                cursor: "pointer",
                backgroundColor: selectedScenes.includes(item)
                  ? "lightblue"
                  : "white",
              }}
              className="p-1 border-b border-gray-200"
            >
              {item.name}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-center p-2">No saved scenes</div>
      )}
      <div className="mt-2">
        <label htmlFor="intervalInput" className="block text-sm text-gray-700">
          Cycle speed (seconds):
        </label>
        <input
          type="number"
          id="intervalInput"
          value={interval}
          onChange={(e) => setInterval(parseInt(e.target.value, 10))}
          className="mt-1 block w-full p-2 border border-gray-300 rounded"
          placeholder="Enter interval in seconds"
          min="1"
        />
      </div>
      <div className="flex flex-row justify-center mt-2">
        <button onClick={handleSubmit} className="m-2">
          Start cycle
        </button>
        <button onClick={stopSceneCycle} className="bg-red-500 shadow m-2">
          Stop cycle
        </button>
      </div>
    </div>
  );
};

export default SceneList;
