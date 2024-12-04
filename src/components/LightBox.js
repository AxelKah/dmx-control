import React from "react";
import { useDrag, useDrop } from "react-dnd";

const ItemType = "LIGHT";

const LightFixture = ({ light, index, moveLight, onClick }) => {
    // useDrag hook to make the component draggable
    const [, dragRef] = useDrag({
        type: ItemType,
        item: { index },
    });

    // useDrop hook to handle the drop action
    const [, dropRef] = useDrop({
        accept: ItemType,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveLight(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <div
            ref={(node) => dragRef(dropRef(node))}
            className="light-box"
            style={{ backgroundColor: light.color }} 
            onClick={() => onClick(light)}
        >
            {`Light ${light.id}`} {/* Display the light ID */}
        </div>
    );
};

export default LightFixture;
