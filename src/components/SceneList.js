import React from "react";
import "../SceneList.css";

const SceneList = ({ items, onItemClick }) => {
  return (
    <div>
      <h1 id="scene-list-title">Scene List</h1>
      <p>Select a scene to activate:</p>
    <ul id="scene-list">
      {items.map((item, index) => (
        <li id="scene-list-item" key={index}>
          <button id="scene-list-button" onClick={() => onItemClick(item)}>
            {item.name}
          </button>
        </li>
      ))}
    </ul>
    </div>
  );
};

export default SceneList;
