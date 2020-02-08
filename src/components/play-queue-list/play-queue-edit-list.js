import PropTypes from 'prop-types';
import React from 'react';
import { Droppable, DragDropContext } from 'react-beautiful-dnd';
import PlayQueueItem from './play-queue-item';
import { usePlayQueue } from '../../hooks/play-queue';

const PlayQueueEditList = ({ reordered }) => {
    const playQueue = usePlayQueue();

    return (
        <DragDropContext onDragEnd={reordered}>
            <Droppable droppableId="play-queue-list">
                {(provided) => (
                    <div className="list-container" ref={provided.innerRef} {...provided.droppableProps}>
                        {playQueue.values.map((song, i) => (
                            <PlayQueueItem
                                key={song.objId}
                                index={i}
                                edit
                                song={song}
                                onRemove={playQueue.delete}
                            />
                        ))}
                        {provided.placeholder}
                        <hr/>
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

PlayQueueEditList.propTypes = {
    reordered: PropTypes.func.isRequired,
};

export default PlayQueueEditList;
