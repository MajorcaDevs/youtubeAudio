import React, { useCallback, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import {
    AudioPlayer,
    Footer,
    Header,
    NowPlayingText,
    PlayQueueList,
    PlayQueueListButton,
    SearchButton,
    SearchPanel,
    UrlInputForm,
} from './components';
import { useAudioPlayer } from './hooks/audio-player';
import useLastFmScrobbler from './hooks/last-fm-scrobbler';
import { formatTime } from './utils';

import './styles/vendors.scss';
import './styles/App/App.scss';

const changeTitle = (() => {
    const title = document.head.querySelector('title');
    return (newTitle) => {
        title.innerText = newTitle;
    };
})();

const App = () => {
    const audioPlayer = useAudioPlayer();
    const lastfm = useLastFmScrobbler();
    const [showingQueue, setShowingQueue] = useState(false);
    const [showingSearch, setShowingSearch] = useState(false);

    const showQueue = useCallback((event) => {
        event.preventDefault();
        setShowingQueue((v) => !v);
        setShowingSearch(false);
    }, []);

    const showSearch = useCallback((event) => {
        event.preventDefault();
        setShowingQueue(false);
        setShowingSearch((v) => !v);
    }, []);

    const onWindowKeyUp = useCallback((event) => {
        if(event.code === 'Space' && event.target.getAttribute('id') !== 'videoURL') {
            if(audioPlayer.ref.current) {
                event.preventDefault();
                event.stopPropagation();
                if(audioPlayer.ref.current.paused) {
                    audioPlayer.ref.current.play().catch();
                } else {
                    audioPlayer.ref.current.pause();
                }
            }
        }
    }, [audioPlayer.ref]);

    useEffect(() => {
        window.addEventListener('keyup', onWindowKeyUp, false);
        return () => window.removeEventListener('keyup', onWindowKeyUp, false);
    }, [onWindowKeyUp]);

    useEffect(() => {
        if(audioPlayer.loadedSong) {
            const title = audioPlayer.loadedSong.title;
            const currentTime = audioPlayer.currentTime ?? 0;
            let duration = audioPlayer.duration ?? 0;
            const time = formatTime(currentTime, duration);
            changeTitle(`${audioPlayer.state === 'playing' ? '▶' : '▮▮'} ${time} - ${title} - YouTube Audio`);
        } else {
            changeTitle('YouTube Audio');
        }
    }, [audioPlayer.currentTime, audioPlayer.duration, audioPlayer.loadedSong, audioPlayer.state]);

    return (
        <div id="AppContainer">
            <Header lastfm={lastfm} />

            <div className="container-fluid">
                <ToastContainer pauseOnHover={false} />
                <p className="greyText" id="greyText">
                    Enjoy the audio from the youtube videos!
                </p>
                <div className="d-flex row justify-content-center align-items-center" id="audioQuery">
                    <div className="col-md-6 col-sm-12">
                        <UrlInputForm />
                        <NowPlayingText />
                        <AudioPlayer />
                    </div>
                </div>
                <PlayQueueList showing={showingQueue} />
                <SearchPanel showing={showingSearch} />
                <PlayQueueListButton onClick={showQueue} showingQueue={showingQueue} left={showingQueue || showingSearch} />
                <SearchButton onClick={showSearch} showingSearch={showingSearch} left={showingQueue || showingSearch} />
            </div>

            <Footer />
        </div>
    );
};

export default App;
