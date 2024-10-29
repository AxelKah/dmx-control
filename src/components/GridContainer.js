import React from "react";
import { useDrop } from "react-dnd";
import LightBox from "./LightBox2";

const ItemTypes = {
  LIGHT: "light",
};

const GridContainer = ({ containerId, lights, onDrop, onClick, updateStartAddress }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.LIGHT,
    drop: (item) => onDrop(item, containerId),
  }));

  return (
    <div ref={drop} id={containerId}>
      {lights.map((light, index) => (
        <LightBox
          key={light.id}
          light={light}
          onClick={onClick}
          index={index}
          updateStartAddress={updateStartAddress}
        />
      ))}
    </div>
  );
};

export default GridContainer;
