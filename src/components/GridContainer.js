import React from "react";
import { useDrop } from "react-dnd";
import LightFixture from "./LightFixture";

// Define item types for drag and drop
const ItemTypes = {
  LIGHT: "light",
};

const GridContainer = ({ containerId, lights, onDrop, onClick, updateStartAddress, updateChannel }) => {
  // Set up the drop target using react-dnd
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.LIGHT,
    drop: (item) => onDrop(item, containerId),
  }));

  return (
    // Attach the drop target to the div
    <div ref={drop} id={containerId}>
      {lights.map((light, index) => (
        // Render each light fixture
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
