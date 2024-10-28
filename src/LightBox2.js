import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
    LIGHT: 'light',
};


const LightBox = ({ light, moveLight , onClick}) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.LIGHT,
        item: { id: light.id, containerId: light.containerId },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className="light-box"
            style={{ backgroundColor: light.color }}

            onClick={() => onClick(light)}

        >
            {`Light ${light.id}`}
        </div>
    );
};

export default LightBox;