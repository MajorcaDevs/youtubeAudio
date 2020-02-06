import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useNightMode } from '../hooks/night-mode';
import SearchPanel from './search-panel';

const SearchButton = ({ showingSearch, onClick, left }) => {
    const nightMode = useNightMode();
    const expectedTranslation = left ? -Math.min(SearchPanel._right, document.body.clientWidth - 45) : 0;
    const styles = useSpring({
        from: { transform: 'translateX(0px)' },
        to: { transform: `translateX(${expectedTranslation}px)` },
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
