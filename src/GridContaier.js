import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import LightBox from './LightBox2';


const ItemTypes = {
    LIGHT: 'light',
};

const GridContainer = ({ containerId, lights, onDrop, onClick,  }) => {
    const [, drop] = useDrop(() => ({
        accept: ItemTypes.LIGHT,
        drop: (item) => onDrop(item, containerId),
    }));

    return (
        <div
            ref={drop}
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 100px)',
                gap: '10px',
                padding: 10,
                backgroundColor: '#ddd',
                minHeight: '200px',
            }}
        >
            {lights.map((light, index) => (
                <LightBox key={light.id} light={light} onClick={onClick} index={index}/>
            ))}
        </div>
    );
};

export default GridContainer;