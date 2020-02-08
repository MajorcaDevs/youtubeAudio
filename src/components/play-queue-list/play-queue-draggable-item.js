import PropTypes from 'prop-types';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const PlayQueueDraggableItem = ({ song, index, onRemove }) => (
    <Draggable draggableId={song.objId} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="row align-items-center"
                style={{ ...provided.draggableProps.style, color: snapshot.isDragging ? '#AAA' : null }}
            >
                <div className="col-auto reorder-icon">
                    <i className="material-icons">reorder</i>
                </div>
                <div className="col">{song.title}</div>
                <div className="col-auto delete-icon">
                    <button className="btn btn-sm" onClick={() => onRemove(song, index)}>
                        <i className="material-icons">delete</i>
                    </button>
                </div>
            </div>
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
};

export default PlayQueueDraggableItem;
