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
            if ( playQueue.values ) {
                return ( <div id="playQueueList"> Play Queue is Empty </div>) ;
            } else {
                return (
                    <div id="playQueueList">
                        {this.props.playQueue.values.map(songInQueue => {
                            return (<div key={songInQueue.id}>
                                    <dt>{songInQueue.title}</dt>
                                    <hr/>
                                </div>
                            )
                        })
                        }
                    </div>

                );
            }
        } else {
            return null;
        }
    }
}
