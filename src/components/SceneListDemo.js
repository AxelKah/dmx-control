import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SceneListDemo = ({ scenes, startSceneCycle }) => {
  const [selectedScenes, setSelectedScenes] = useState([]);

  const handleSelect = (scene) => {
    if (selectedScenes.includes(scene)) {
      setSelectedScenes(selectedScenes.filter(i => i !== scene));
    } else if (selectedScenes.length < 2) {
      setSelectedScenes([...selectedScenes, scene]);
    }
  };

  const handleSubmit = () => {
    if (selectedScenes.length === 2) {
      sendSelection(selectedScenes);
    } else {
      alert('Please select exactly two items.');
    }
  };
const sendSelection = async (scene) => {
    console.log('Selected items:', scene);
    await startSceneCycle(scene[0].lights, scene[1].lights, 10000);
    // Add your function logic here
};

  return (
    <div>
      <ul>
        {scenes.map((item, index) => (
          <li
            key={index}
            onClick={() => handleSelect(item)}
            style={{
              cursor: 'pointer',
              backgroundColor: selectedScenes.includes(item) ? 'lightblue' : 'white',
            }}
          >
            {item.name}
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Submit Selection</button>
    </div>
  );
};

SceneListDemo.propTypes = {
  scenes: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    lights: PropTypes.array.isRequired,
  })).isRequired,
  startSceneCycle: PropTypes.func.isRequired,
};

export default SceneListDemo;