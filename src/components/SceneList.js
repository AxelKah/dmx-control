import React from "react";

const SceneList = ({ items, onItemClick }) => {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {" "}
          <button onClick={() => onItemClick(item)}>{item.name}</button>
        </li>
      ))}
    </ul>
  );
};

export default SceneList;
