import React, { useCallback } from 'react';
import { useNightMode, useNightModeSetter } from '../hooks/night-mode';

const Header = ({ lastfm }) => {
    const nightMode = useNightMode();
    const setNightMode = useNightModeSetter();

    const changeNightMode = useCallback((e) => {
        e.preventDefault();
        setNightMode(!nightMode);
    }, [nightMode, setNightMode]);

    return (
        <header className="AppHeader" id="AppHeader">
            <h1 className="App-title">YouTube Audio Player</h1>
            <button className="btn btn-sm btn-outline-light float-right onoffmode" id="changeSkinButton" onClick={changeNightMode}>
                { !nightMode ? <i className="material-icons">brightness_2</i> : <i className="material-icons">wb_sunny</i>}
            </button>
            <button className="btn btn-sm btn-outline-light float-right lastfm" onClick={ () => !lastfm.hasLoggedIn ? lastfm.startAuthentication() : lastfm.deauthenticate() }>
                <img src="https://www.last.fm/static/images/footer_logo@2x.49ca51948b0a.png" width={ 24 } alt={ lastfm.username } />
                { lastfm.hasLoggedIn && <i className="material-icons"
                    style={{ position: 'absolute', top: 0, left: 0, fontSize: 34, marginLeft: 1, color: 'rgb(255, 180, 180)' }}>close</i>}
            </button>
        </header>
    );
};

export default Header;