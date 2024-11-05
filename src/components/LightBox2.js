import React from "react";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = {
  LIGHT: "light",
};

const LightBox = ({ light, moveLight, onClick, index, updateStartAddress, containerId, updateChannel }) => {
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

  const handleDoubleClick = () => {
    const newStartAddress = prompt("Enter new start address:", light.startAddress);
    const newChannel = prompt("Enter new channel:", light.channel);
    if (newStartAddress !== null) {
      updateStartAddress(light.id, parseInt(newStartAddress, 10));
    }
    if (newChannel !== null) {
      updateChannel(light.id, parseInt(newChannel, 10));
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="light-box"
      style={{ backgroundColor: light.color, opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onClick(light)}
      onDoubleClick={handleDoubleClick}
    >
      {`Light ${light.id} Address ${light.startAddress}`}
    </div>
  );
};

export default LightBox;