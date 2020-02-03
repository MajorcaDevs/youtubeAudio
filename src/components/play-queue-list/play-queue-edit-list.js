import PropTypes from 'prop-types';
import React from 'react';
import { Droppable, DragDropContext } from 'react-beautiful-dnd';
import { useTransition } from 'react-spring';
import PlayQueueItem from './play-queue-item';
import { usePlayQueue } from '../../hooks/play-queue';

const PlayQueueEditList = ({ edit, reordered }) => {
    const playQueue = usePlayQueue();
    const transitions = useTransition(playQueue.values, ({ id }) => id, {
        from: { transform: 'translateX(25px)', opacity: 0 },
        enter: { transform: 'translateX(0)', opacity: 1 },
        leave: { transform: 'scale(0.9)', opacity: 0 },
    });

    return (
        <DragDropContext onDragEnd={reordered}>
            <Droppable droppableId="play-queue-list">
                {(provided) => (
                    <div className="list-container" ref={provided.innerRef} {...provided.droppableProps}>
                        {transitions.map(({ item: song, key, props }, i) => (
                            <PlayQueueItem
                                key={key}
                                index={i}
                                edit={edit}
                                song={song}
                                onRemove={playQueue.delete}
                                style={props}
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
    edit: PropTypes.bool.isRequired,
    reordered: PropTypes.func.isRequired,
};

export default PlayQueueEditList;
