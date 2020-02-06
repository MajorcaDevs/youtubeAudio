import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useNightMode } from '../hooks/night-mode';
import PlayQueueList from './play-queue-list';

const PlayQueueListButton = ({ showingQueue, onClick, left }) => {
    const nightMode = useNightMode();
    const expectedTranslation = left ? -Math.min(PlayQueueList._right, document.body.clientWidth - 45) : 0;
    const styles = useSpring({
        from: { transform: 'translateX(0px)' },
        to: { transform: `translateX(${expectedTranslation}px)` },
    });

    return (
        <animated.button
            id="playQueue"
            style={ styles }
            className={`btn ${showingQueue ? 'right' : 'left'} btn-outline-${nightMode ? 'light' : 'dark'}`}
            onClick={ onClick }>
            <div id="arrow" className={`${showingQueue ? 'right' : 'left'}`}/>
        </animated.button>
    );
};

export default PlayQueueListButton;
