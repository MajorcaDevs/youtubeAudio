import PropTypes from 'prop-types';
import React from 'react';
import { animated } from 'react-spring';
import { Draggable } from 'react-beautiful-dnd';

const PlayQueueDraggableItem = ({ song, index, onRemove, style }) => (
    <Draggable key={ `${index}-${song.id}` } draggableId={ `${index}-${song.id}` } index={ index }>
        {(provided, snapshot) => (
            <animated.div
                ref={ provided.innerRef }
                { ...provided.draggableProps }
                { ...provided.dragHandleProps }
                className="row"
                style={{ ...provided.draggableProps.style, color: snapshot.isDragging ? '#AAA' : null, ...style }}
            >
                <div className="col-auto reorder-icon">
                    <i className="material-icons">reorder</i>
                </div>
                <div className="col">{ song.title }</div>
                <div className="col-auto delete-icon">
                    <button className="btn btn-sm" onClick={ () => onRemove(song, index) }>
                        <i className="material-icons">delete</i>
                    </button>
                </div>
            </animated.div>
        )}
    </Draggable>
);

PlayQueueDraggableItem.propTypes = {
    song: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
    }).isRequired,
    onRemove: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    style: PropTypes.object,
};

export default PlayQueueDraggableItem;
