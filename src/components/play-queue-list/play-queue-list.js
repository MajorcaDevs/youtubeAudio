import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTransition, animated } from 'react-spring';
import PlayQueueEditList from './play-queue-edit-list';
import PlayQueueInfoList from './play-queue-info-list';
import { usePlayQueue } from '../../hooks/play-queue';
import '../../styles/PlayQueueList/PlayQueueList.scss';

const PlayQueueList = ({ showing }) => {
    const [edit, setEdit] = useState(false);
    const playQueue = usePlayQueue();
    const transitions = useTransition(showing, null, {
        from: { transform: PlayQueueList._right },
        enter: { transform: 0 },
        leave: { transform: PlayQueueList._right },
    });

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

    const clearQueue = useCallback((e) => {
        e.preventDefault();
        playQueue.empty();
    }, [playQueue]);

    return transitions.map(({ item, key, props }) =>
        item && (
            <animated.div
                key={key}
                id="playQueueList"
                /* If you ask, when value is 0, the translateX should not be set otherwise the D&D will stop working */
                style={{ transform: props.transform.interpolate((v) => v ? `translateX(${v}px)` : '') }}
                className="py-3 list"
            >
                <div>
                    <h2>Play Queue</h2>
                    <div className="col-auto edit-icon">
                        <button className={`btn btn-sm edit-button ${edit ? 'active' : ''}`} onClick={changeEditMode}>
                            <i className="material-icons">edit</i>
                        </button>
                        <button className="btn btn-sm clear-button" onClick={clearQueue}>
                            <i className="material-icons">clear_all</i>
                        </button>
                    </div>
                </div>
                {playQueue.values.length === 0 && <span className="text-muted">Play queue is empty</span>}
                {edit ? <PlayQueueEditList reordered={reordered} /> : <PlayQueueInfoList />}
            </animated.div>
        )
    );
};

PlayQueueList.propTypes = {
    showing: PropTypes.bool.isRequired,
};

Object.defineProperty(PlayQueueList, '_right', {
    get: () => {
        const windowWidth = window.document.body.clientWidth;
        if(windowWidth < 576) {
            return windowWidth * 0.90;
        } else if(windowWidth < 768) {
            return 288;
        } else if(windowWidth < 1200) {
            return 384;
        } else {
            return 400;
        }
    },
    enumerable: true,
});

export default PlayQueueList;
