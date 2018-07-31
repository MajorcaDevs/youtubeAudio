import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-spring';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import './styles/PlayQueueList/PlayQueueList.css';


const PlayQueueItem = ({ song, index, onRemove }) => (
    <Draggable key={ `${index}-${song.id}` } draggableId={ song.id } index={ index }>
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

export default class PlayQueueList extends Component{

    static propTypes = {
        showing: PropTypes.bool.isRequired,
        playQueue: PropTypes.object.isRequired,
        onPlaylistItemReorder: PropTypes.func.isRequired,
        onPlaylistItemRemove: PropTypes.func.isRequired,
    };

    constructor(props){
        super(props);
        this.state = {
            edit: false
        };
        this.changeEditMode = this.changeEditMode.bind(this);
        this.reordered = this.reordered.bind(this);
    }

    render () {
        const { showing, playQueue } = this.props;
        const { edit } = this.state;
        let element = [];
        if (showing) {
            if (playQueue.values.length <= 1) {
                element.push(styles => <div id="playQueueList" style={styles}> Play Queue is Empty </div>);
            } else {
                element.push(styles => (
                    <div id="playQueueList" style={{overflowY: 'scroll', ...styles}}>
                        <div>
                            <h2>Play Queue</h2>
                            <div className="col-auto edit-icon">
                                <button className={`btn btn-sm edit-button ${edit ? 'active' : ''}`} onClick={ this.changeEditMode }>
                                    <i className="material-icons">edit</i>
                                </button>
                            </div>
                        </div>
                        {edit ?
                            <DragDropContext onDragEnd={this.reordered}>
                                <Droppable droppableId="play-queue-list">
                                    {(provided) => (
                                        <div className="list-container" ref={provided.innerRef}>
                                            {[...this.props.playQueue.values].splice(1).map((songInQueue, i) => (
                                                <PlayQueueItem key={i} song={songInQueue} index={i}
                                                               onRemove={this.props.onPlaylistItemRemove}/>
                                            ))
                                            }
                                            <hr/>
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                            :
                            <div className="list-container">
                                {[...this.props.playQueue.values].splice(1).map((songInQueue, i) => (
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
                ));
            }
        }

        return (
            <Transition
                keys={element.map(() => 'queue')}
                from={{ right: PlayQueueList._right }}
                enter={{ right: 0 }}
                leave={{ right: PlayQueueList._right }}>
                    { element }
            </Transition>
        );
    }

    changeEditMode(e) {
        e.preventDefault();
        this.setState({
            edit: !this.state.edit
        });
    }

    reordered(result) {
        if(!result.destination) {
            return;
        }

        this.props.onPlaylistItemReorder(result.source.index, result.destination.index);
    }

    static get _right() {
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
    }
}
