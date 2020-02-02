import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-spring/renderprops';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { usePlayQueue } from '../hooks/play-queue';
import '../styles/PlayQueueList/PlayQueueList.scss';


const PlayQueueItem = ({ song, index, onRemove }) => (
    <Draggable key={ `${index}-${song.id}` } draggableId={ `${index}-${song.id}` } index={ index }>
        {(provided, snapshot) => (
            <div ref={ provided.innerRef }
                { ...provided.draggableProps }
                { ...provided.dragHandleProps }
                className="row"
                style={{ ...provided.draggableProps.style, color: snapshot.isDragging ? '#AAA' : null }}>
                <div className="col-auto reorder-icon">
                    <i className="material-icons">reorder</i>
                </div>
                <div className="col">{ song.title }</div>
                <div className="col-auto delete-icon">
                    <button className="btn btn-sm" onClick={ () => onRemove(song, index) }>
                        <i className="material-icons">delete</i>
                    </button>
                </div>
            </div>
        )}
    </Draggable>
);

const PlayQueueList = ({ showing }) => {
    const [edit, setEdit] = useState(false);
    const playQueue = usePlayQueue();

    const reordered = useCallback(({ source, destination }) => {
        if(!destination) {
            return;
        }

        playQueue.swap(source.index, destination.index);
    }, [playQueue]);

    const changeEditMode = useCallback((e) => {
        e.preventDefault();
        setEdit((edit) => !edit);
    }, []);

    return (
        <Transition
            items={showing}
            from={{ right: PlayQueueList._right }}
            enter={{ right: 0 }}
            leave={{ right: PlayQueueList._right }}
        >
            {which => which && (playQueue.values.length <= 1
                ? styles => <div id="playQueueList" style={styles}> Play Queue is Empty </div>
                : styles => (
                    <div id="playQueueList" style={{overflowY: 'scroll', ...styles}}>
                        <div>
                            <h2>Play Queue</h2>
                            <div className="col-auto edit-icon">
                                <button className={`btn btn-sm edit-button ${edit ? 'active' : ''}`} onClick={changeEditMode}>
                                    <i className="material-icons">edit</i>
                                </button>
                            </div>
                        </div>
                        {edit ?
                            <DragDropContext onDragEnd={reordered}>
                                <Droppable droppableId="play-queue-list">
                                    {(provided) => (
                                        <div className="list-container" ref={provided.innerRef} {...provided.droppableProps}>
                                            {playQueue.values.slice(1).map((songInQueue, i) => (
                                                <PlayQueueItem key={i} song={songInQueue} index={i}
                                                    onRemove={playQueue.delete}/>
                                            ))}
                                            {provided.placeholder}
                                            <hr/>
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                            :
                            <div className="list-container">
                                {playQueue.values.slice(1).map((songInQueue, i) => (
                                    <div className="row" key={ i }>
                                        <div className="col">
                                            { songInQueue.title }
                                        </div>
                                    </div>
                                ))}
                                <hr/>
                            </div>
                        }
                    </div>
                ))}
        </Transition>
    );
};

PlayQueueList.propTypes = {
    showing: PropTypes.bool.isRequired,
};

Object.defineProperty(PlayQueueList, '_right', {
    get: () => {
        const windowWidth = window.document.body.clientWidth;
        if(windowWidth < 576) {
            return -windowWidth * 0.90;
        } else if(windowWidth < 768) {
            return -288;
        } else if(windowWidth < 1200) {
            return -384;
        } else {
            return -400;
        }
    },
    enumerable: true,
});

export default PlayQueueList;
