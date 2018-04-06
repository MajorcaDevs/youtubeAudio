import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles/PlayQueueList/PlayQueueList.css';


export default class PlayQueueList extends Component{

    static propTypes = {
        showing: PropTypes.bool.isRequired,
        playQueue: PropTypes.object.isRequired,
    };

    constructor(props){
        super(props);
        this.state = ({
            isClosing: false
        });
    }

    render () {
        const { showing, playQueue } = this.props;
        const { isClosing } = this.state;
        if ( showing || isClosing ) {
            if ( playQueue.values.length <= 1 ) {
                return ( <div id="playQueueList"> Play Queue is Empty </div>) ;
            } else {
                return (
                    <div id="playQueueList" style={{overflowY: 'scroll'}}>
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

                );
            }
        } else {
            return null;
        }
    }
}
