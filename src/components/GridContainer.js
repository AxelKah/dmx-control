import React from "react";
import { useDrop } from "react-dnd";
import LightFixture from "./LightFixture";

const ItemTypes = {
  LIGHT: "light",
};

const GridContainer = ({ containerId, lights, onDrop, onClick, updateStartAddress, updateChannel }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.LIGHT,
    drop: (item) => onDrop(item, containerId),
  }));

  return (
    <div ref={drop} id={containerId}>
      {lights.map((light, index) => (
        <LightFixture
          key={light.id}
          light={light}
          onClick={onClick}
          index={index}
          updateStartAddress={updateStartAddress}
          containerId={containerId}
          updateChannel={updateChannel}
        />
      ))}
    </div>
  );
};

export default GridContainer;
