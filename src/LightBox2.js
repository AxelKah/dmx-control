import React from "react";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = {
  LIGHT: "light",
};

const LightBox = ({ light, moveLight, onClick, index }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.LIGHT,
    item: { id: light.id, containerId: light.containerId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop({
    accept: ItemTypes.LIGHT,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        draggedItem.index = index;
      }
    },
  });

  console.log("Drag item:", { id: light.id, index });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="light-box"
      style={{ backgroundColor: light.color, opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onClick(light)}
    >
      {`Light ${light.id}`}
    </div>
  );
};

export default LightBox;
