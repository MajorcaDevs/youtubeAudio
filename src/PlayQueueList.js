import React, { Component } from 'react';
import './PlayQueueList.css';
import PlayQueue from "./PlayQueue";


export default class PlayQueueList extends Component{

    constructor(props){
        super(props);
        this.state = ({
            showing: false,
            playQueue: new PlayQueue()
        })
    }

    render () {
        const { showing } = this.props;
        if ( showing ){
            return (
              <div id="playQueueList">
                  {this.props.playQueue.values.map(songInQueue => {
                      return ( <div key={songInQueue.id}>
                              <dt>{songInQueue.title}</dt>
                              <hr/>
                          </div>
                      )
                  })
                  }
              </div>

            );
        } else {
            return null;
        }
    }
}
