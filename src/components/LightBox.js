import React from "react";
import { useDrag, useDrop } from "react-dnd";
const ItemType = "LIGHT";

const LightFixture = ({ light, index, moveLight, onClick }) => {
    const [, dragRef] = useDrag({
        type: ItemType,
        item: { index },
    });

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
            {`Light ${light.id}`}
        </div>
    );
};

export default LightFixture;
