import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useNightMode } from '../hooks/night-mode';
import PlayQueueList from './play-queue-list';

const SearchButton = ({ showingSearch, onClick, left }) => {
    const nightMode = useNightMode();
    const styles = useSpring({
        from: { right: 15 },
        to: { right: left ? Math.min(-PlayQueueList._right + 15, document.body.clientWidth - 45) : 15 },
    });

    return (
        <animated.button
            id="searchPanelButton"
            style={ styles }
            className={`btn ${showingSearch ? 'right' : 'left'} btn-outline-${nightMode ? 'light' : 'dark'}`}
            onClick={ onClick }
        >
            <i className="material-icons">search</i>
        </animated.button>
    );
};

export default SearchButton;
