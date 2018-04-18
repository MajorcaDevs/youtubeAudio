import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-spring';
import './styles/PlayQueueList/PlayQueueList.css';


export default class PlayQueueList extends Component{

    static propTypes = {
        showing: PropTypes.bool.isRequired,
        playQueue: PropTypes.object.isRequired,
    };

    constructor(props){
        super(props);
    }

    render () {
        const { showing, playQueue } = this.props;
        let element = [];
        if (showing) {
            if (playQueue.values.length <= 1) {
                element.push(styles => <div id="playQueueList" style={styles}> Play Queue is Empty </div>);
            } else {
                element.push(styles => (
                    <div id="playQueueList" style={{overflowY: 'scroll', ...styles}}>
                        <div>Play Queue</div>
                        <div style={{marginBottom: '100px'}}>
                            {[...this.props.playQueue.values].splice(1).map((songInQueue, i) => {
                                return (<div key={`${i}-${songInQueue.id}`}>
                                        <dt>{songInQueue.title}</dt>
                                        <hr/>
                                    </div>
                                )
                            })
                            }
                            <div>End list</div>
                        </div>
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
