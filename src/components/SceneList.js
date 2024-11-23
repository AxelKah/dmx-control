import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const SceneList = ({ scenes = [], startSceneCycle }) => {
  const [selectedScenes, setSelectedScenes] = useState([]);

  useEffect(() => {
    // to reset selected scenes if received scenes changes
    setSelectedScenes([]);
  }, [scenes]);

  const handleSelect = (scene) => {
    if (selectedScenes.includes(scene)) {
      setSelectedScenes(selectedScenes.filter((i) => i !== scene));
    } else if (selectedScenes.length < 2) {
      setSelectedScenes([...selectedScenes, scene]);
    }
  };

  const handleSubmit = () => {
    if (selectedScenes.length === 2) {
      console.log("Submitting selected scenes:", selectedScenes);
      sendSelection(selectedScenes);
    } else {
      alert("Please select exactly two items.");
    }
  };

  const sendSelection = async (scenes) => {
    console.log("Selected items:", scenes);
    await startSceneCycle(scenes, 2500);
  };

  return (
    <div>
      <ul>
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
          >
            {item.name}
          </li>
        ))}
      </ul>
      <div className="flex flex-row">
        <button onClick={handleSubmit}>Start cycle</button>
      </div>
    </div>
  );
};

SceneList.propTypes = {
  scenes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      colors: PropTypes.arrayOf(
        PropTypes.shape({
          lightId: PropTypes.number.isRequired,
          color: PropTypes.string.isRequired,
          intensity: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  startSceneCycle: PropTypes.func.isRequired,
};

export default SceneList;
