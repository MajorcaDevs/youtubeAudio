import React, { Component } from 'react';
import $ from 'jquery';
import { ToastContainer, toast, style } from 'react-toastify';
import { Spring } from 'react-spring';
import bowser from 'bowser';
import 'bootstrap/dist/css/bootstrap.css';
import 'material-design-icons/iconfont/material-icons.css';
import './styles/App/App.css';
import github from './github.svg';
import PlayQueue from './PlayQueue';
import PlayQueueList from './PlayQueueList';
import SearchPanel from './SearchPanel';
import { Lastfm, parseTitle } from './LastFM';
import { selectBestOption, loadAudioURL, addYoutubePlaylist } from './api';
// import AdBlockDetect from 'react-ad-block-detect';

style({
    TOP_RIGHT: {
        top: '80px',
        right: '1em'
    }
});

class App extends Component {
    constructor (props) {
        super(props);
        this.state = ({
            youtubeVideoURL: "",
            qualityFromAudio: 0,
            invalidURL: false,
            youtubeAudioURL: "",
            youtubeVideoTitle: "",
            loading: false,
            nightMode: true,
            currentFormat: "",
            youtubeVideoID: "",
            showingQueue: false,
            showingSearch: false,
            youtubePlaylistID: "",
            playQueue: new PlayQueue(),
            isPlaying: false,
            scrobblingState: 'none', // 'none', 'nowPlaying', 'scrobbled'
        });
        this.audioRef = React.createRef();
        this.lastfm = new Lastfm(); window.xD = v => this.lastfm.disableScrobblings = !!v;
        this.listenerTestButton = this.listenerTestButton.bind(this);
        this.nightModeListener = this.nightModeListener.bind(this);
        this.enqueueFromSeach = this.enqueueFromSeach.bind(this);
        this.onWindowKeyUp = this.onWindowKeyUp.bind(this);
        this.titleProgress = this.titleProgress.bind(this);
        this.playFromSeach = this.playFromSeach.bind(this);
        this.listenerForm = this.listenerForm.bind(this);
        this.onSongError = this.onSongError.bind(this);
        this.addToQueue = this.addToQueue.bind(this);
        this.formatTime = this.formatTime.bind(this);
        this.showQueue = this.showQueue.bind(this);
        this.showSearch = this.showSearch.bind(this);
        this.onSongEnd = this.onSongEnd.bind(this);
        this.playSong = this.playSong.bind(this);
        this.onPause = this.onPause.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.clear = this.clear.bind(this);
    }

    _testYoutubeVideoURL = "https://www.youtube.com/watch?v=bM7SZ5SBzyY";

    clear(){
        this.setState({playQueue: this.state.playQueue.emptyQueue()});
    }

    async addToQueue() {
        if(this.state.youtubeVideoID) {
            this.setState({ loading: true });
            try {
                const { title } = await loadAudioURL(this.state.youtubeVideoID);
                this.setState({
                    loading: false,
                    playQueue: this.state.playQueue.add({
                        id: this.state.youtubeVideoID,
                        title
                    })
                }, () => {
                    if (this.state.playQueue.values.length && !this.state.youtubeAudioURL){
                        this.loadSong(this.state.playQueue.values[0].id);
                        this.loadingToast.dismiss();
                    } else {
                        this.loadingToast.success('Enqueued', `"${title}" was added to the queue`)
                    }
                });
            } catch(e) {
                this.setState({ loading: false });
                this.loadingToast.error(e.message, e.descriptiveMessage);
            }
        } else if(this.state.youtubePlaylistID) {
            this.loadPlaylist();
        }
    }

    playSong(){
        this.setState({
            playQueue: !this.state.youtubeVideoID ? this.state.playQueue : this.state.playQueue.addFirst({
                id: this.state.youtubeVideoID,
                title: null
            })
        });
        if (this.state.youtubeVideoID) {
            this.loadSong(this.state.youtubeVideoID, true);
        } else if(this.state.youtubePlaylistID) {
            this.loadPlaylist(true);
        } else if(this.state.playQueue.values.length > 0 && !this.state.youtubeVideoURL) {
            this.loadSong(this.state.playQueue.values[0].id);
        }
    }

    enqueueFromSeach(item) {
        if(item.id.kind === 'youtube#video') {
            this.setState({ youtubeVideoID: item.id.videoId }, () => this.addToQueue());
        } else if(item.id.kind === 'youtube#playlist') {
            this.setState({ youtubePlaylistID: item.id.playlistId }, () => this.addToQueue());
        }
    }

    playFromSeach(item) {
        if(item.id.kind === 'youtube#video') {
            this.setState({ youtubeVideoID: item.id.videoId }, () => this.playSong());
        } else if(item.id.kind === 'youtube#playlist') {
            this.setState({ youtubePlaylistID: item.id.playlistId }, () => this.playSong());
        }
    }

    /**
     * Loads the video and prepares the audio player. Modifies this state: loading, currentFormat, qualityFromAudio,
     * youtubeAudioURL, youtubeVideoTitle, scrobblingState. Shows a loading spinner and updates the notification
     * with the good result or the error.
     * @param {string} youtubeVideoID Given a Youtube Video URL, loads the best quality for the current browser and
     * prepares the player
     * @param {boolean} autoplay When the player is ready, if it is true, then will start playing automatically
     */
    async loadSong(youtubeVideoID, autoplay) {
        this.setState({ loading: true });
        try {
            const { codec, bitrate, bps, id } = await selectBestOption(youtubeVideoID);
            this.setState({
                currentFormat: `${codec}@~${bitrate ? bitrate : bps}kbps`,
                qualityFromAudio: id
            });

            const { url, title } = await loadAudioURL(youtubeVideoID, id);
            this.setState({
                youtubeAudioURL: url,
                youtubeVideoTitle: title,
                loading: false,
                scrobblingState: 'none'
            }, () => {
                $("title").text(`${this.state.youtubeVideoTitle} - YouTube Audio`);
                if(autoplay) {
                    this.audioRef.current.oncanplay = async (e) => {
                        try {
                            await this.audioRef.current.play();
                            this.loadingToast.dismiss();
                        } catch(e) {
                            toast.update(this.loadingToast._toast, {
                                type: toast.TYPE.INFO,
                                render: <NotifContent title='Press play manually' light={false}
                                              text={'Due to your browser configuration, we cannot press play for you.' +
                                                    ' You can change your autoplay options in the browser\'s configuration.'} />,
                                closeButton: null,
                                closeOnClick: true,
                            });
                        }
                        this.audioRef.current.oncanplay = null;
                        this.loadingToast = null;
                    };
                } else {
                    this.loadingToast.dismiss();
                    this.loadingToast = null;
                }
            });
        } catch(e) {
            this.setState({ loading: false, youtubeAudioURL: "", youtubeVideoTitle: "" });
            this.loadingToast.error(e.message, e.descriptiveMessage);
            this.loadingToast = null;
        }
    }

    /**
     * Loads the playlist stored in `this.state.youtubePlaylistID` into the queue, showing a loading spinner,
     * and, if there's nothing playing, it will start playing the first song of the play queue.
     * @param {boolean} startPlaying When the playlist is loaded, should the player start playing?
     */
    async loadPlaylist(startPlaying) {
        this.setState({ loading: true });
        try {
            const items = await addYoutubePlaylist(this.state.youtubePlaylistID, true);
            let newState = {
                loading: false,
                playQueue: this.state.playQueue.add(...items),
            };
            if(!this.state.youtubeAudioURL && newState.playQueue.values.length > 0) {
                newState.youtubeVideoID = newState.playQueue.values[0].id;
                newState.youtubeVideoTitle = newState.playQueue.values[0].title;
                this.loadSong(newState.playQueue.values[0].id, startPlaying);
            }
            this.setState(newState);
        } catch(e) {
            this.setState({ loading: false });
            this.loadingToast.error(e.message, e.descriptiveMessage);
            this.loadingToast = null;
        }
    }

    listenerTestButton(event) {
        event.preventDefault();
        this.setState({ youtubeVideoURL: this._testYoutubeVideoURL });
        this.loadSong(this.getYoutubeVideoID(this._testYoutubeVideoURL), true);
    }

    listenerForm(event) {
        let url = event.target.value.trim();
        let newState = {youtubeVideoURL: url};
        let youtubeVideoID = this.getYoutubeVideoID(url);
        let youtubePlaylistID = this.getPlaylistID(url);
        if (youtubeVideoID !== null){
            newState.invalidURL = false;
            newState.youtubeVideoID = youtubeVideoID;
        } else if(youtubePlaylistID !== null) {
            newState.invalidURL = false;
            newState.youtubePlaylistID = youtubePlaylistID;
        } else {
            newState.invalidURL = url.length !== 0;
        }
        this.setState(newState);
        if(!this.state.youtubeAudioURL) {
            //If it is not playing anything, then we can safely change that
            $("title").text("YouTube Audio");
        }
    }

    /**
     * Tests whether the URL is a YouTube video and extract the video ID from it.
     * @param {string} url URL to test
     * @returns the YouTube video ID if the URL is valid, or null otherwise
     */
    getYoutubeVideoID(url){
        let youtubeVideoID =
            /(?:(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\/?\?(.+))|(?:(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+))/
                .exec(url);
        if (youtubeVideoID !== null) {
            if(youtubeVideoID[2]) {
                return youtubeVideoID[2];
            } else if(youtubeVideoID[1]) {
                let query = App.parseQuery(youtubeVideoID[1]);
                return query.v;
            }
        } else
            this.setState({loading: false});
        return null;
    }

    /**
     * Tests whether the URL is a YouTube playlist and extract the playlist ID from it.
     * @param {string} url URL to test
     * @returns the YouTube playlist ID if the URL is valid, or null otherwise
     */
    getPlaylistID(url) {
        let youtubePlaylistID = /playlist\?(.+)/g.exec(url);
        if(youtubePlaylistID !== null) {
            return App.parseQuery(youtubePlaylistID[1]).list;
        }
        return null;
    }

    /**
     * Converts the the query of an URL into a JS object
     * @param {string} str The query of an URL (the part that starts with ?) but without the initial ?
     * @returns A JS Object that represents the query
     */
    static parseQuery(str) {
        return str
            .split('&')
            .map(e => e.split('='))
            .reduce((obj, last) => ({ ...obj, [last[0]]: last[1] }), {});
    }

    nightModeListener(event){
        event.preventDefault();
        this.setState({ nightMode: !this.state.nightMode });
    }

    /**
     * Converts a time in seconds to `{hour:}minutes:seconds` format.
     * @param {number} currentTime Time in seconds
     * @returns The time formated
     */
    formatTime(currentTime) {
        const seconds = Math.round(currentTime) % 60;
        let minutes = Math.floor(Math.round(currentTime) / 60);
        if(!this.audioRef.current || this.audioRef.current.duration < 3600) {
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
            const hours = Math.floor(minutes / 60);
            minutes %= 60;
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }

    titleProgress(event){
        const currentTime = this.audioRef.current.currentTime;
        let duration = this.audioRef.current.duration;
        let time = this.formatTime(currentTime);
        $("title").text(`${this.state.isPlaying ? "▶" : "▮▮"} ${time} - ${this.state.youtubeVideoTitle} - YouTube Audio`);

        if(bowser.safari) {
            //Workaround for Safari m4a playing bug
            duration /= 2;
        }

        if(this.lastfm.hasLoggedIn) {
            //We must end the nowPlaying, if the title is available
            if(this.state.scrobblingState === 'none') {
                const parsed = parseTitle(this.state.youtubeVideoTitle);
                if(parsed) {
                    this.setState({ scrobblingState: null });
                    this.lastfm.updateNowPlaying({
                        ...parsed,
                        duration,
                        timestamp: new Date()
                    }).then(() => this.setState({ scrobblingState: 'nowPlaying' }));
                } else {
                    this.setState({ scrobblingState: 'nowPlaying' });
                }
            } else if(this.state.scrobblingState === 'nowPlaying' && currentTime >= Math.min(duration / 2, 240)) {
                //At the half of the song or when it reaches 4min, the scrobble must be sent, but only if
                //we can get the song's title
                const parsed = parseTitle(this.state.youtubeVideoTitle);
                if(parsed) {
                    this.setState({ scrobblingState: null });
                    this.lastfm.scrobble({
                        ...parsed,
                        duration,
                        timestamp: new Date()
                    }).then(() => this.setState({ scrobblingState: 'scrobbled' }));
                } else {
                    this.setState({ scrobblingState: 'scrobbled' });
                }
            }
        }

        if(currentTime > duration && currentTime - duration > 1) {
            //Workaround for Safari m4a playing bug
            this.audioRef.current.pause();
            this.onSongEnd(null);
        }
    }

    onPlay(){ this.setState({isPlaying: true}); }

    onPause(){ this.setState({isPlaying: false}); }

    onSongEnd(event) {
        this.setState({ playQueue: this.state.playQueue.deleteFirst(), scrobblingState: 'none' }, () => {
            if (this.state.playQueue.values.length > 0) {
                this.loadSong(this.state.playQueue.values[0].id, true);
            }
        });
    }

    onSongError(event) {
        switch(event.target.error.code) {
        case event.target.error.MEDIA_ERR_NETWORK:
            toast.error(<NotifContent title='There was a network error'
                                      text='Could not load the song. Check your internet connection.' />,
                        { autoClose: false }
            );
            break;

        case event.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED: {
            const { youtubeVideoID, qualityFromAudio } = this.state;
            this.setState({
                youtubeAudioURL: `https://ytdl-audio-api.melchor9000.me/api/${youtubeVideoID}/${qualityFromAudio}/passthrough`
            });
            break;
        }

        default: return;
        }
    }

    showQueue(event) {
        event.preventDefault();
        this.setState({
            showingQueue: !this.state.showingQueue,
            showingSearch: !this.state.showingQueue ? false : this.state.showingSearch
        });
    }

    showSearch(event) {
        event.preventDefault();
        this.setState({
            showingSearch: !this.state.showingSearch,
            showingQueue: !this.state.showingSearch ? false : this.state.showingQueue
        });
    }

    onWindowKeyUp(event) {
        if(event.code === 'Space' && event.target.getAttribute('id') !== "videoURL") {
            if(this.audioRef.current) {
                event.preventDefault();
                event.stopPropagation();
                if(this.audioRef.current.paused) {
                    this.audioRef.current.play().catch();
                } else {
                    this.audioRef.current.pause();
                }
            }
        }
    }

    componentDidMount() {
        window.addEventListener('keyup', this.onWindowKeyUp);
        window.addEventListener('resize', () => this.forceUpdate());
    }

    componentDidUpdate(prevProps, prevState) {
        if(!prevState.loading && this.state.loading) {
            this.loadingToast = new LoadingToastController();
        }

        if(prevState.isPlaying !== this.state.isPlaying){
            $("title").text(
                `${this.state.isPlaying ? "▶" : "▮▮"}
                ${this.formatTime(this.audioRef.current.currentTime)} - ${this.state.youtubeVideoTitle} - YouTube Audio`
            );
        }

        if(!prevState.nightMode && this.state.nightMode) {
            $('body').addClass('AppDark').removeClass('AppLight');
        } else if(prevState.nightMode && !this.state.nightMode) {
            $('body').removeClass('AppDark').addClass('AppLight');
        }
    }

    render() {
        const { youtubeVideoURL, invalidURL, youtubeVideoTitle, youtubeAudioURL, loading, nightMode,
            showingQueue, currentFormat, playQueue, showingSearch } = this.state;
        return (
            <div id="AppContainer">
                <Header nightMode={ nightMode } nightModeListener={ this.nightModeListener } lastfm={ this.lastfm } />
                <div className="container-fluid">
                    <ToastContainer pauseOnHover={ false } />
                    <p className="greyText" id="greyText">
                        Enjoy the audio from the youtube videos!
                    </p>
                    <div className="d-flex row justify-content-center align-items-center" id="audioQuery">
                        <div className="col-md-6 col-sm-12">
                        {/*
                        ----
                        Disabled until bug confirm
                        ----
                        <AdBlockDetect>
                        <div className="alert alert-danger" role="alert">
                          Please, consider disabling Ad-Block in order to make the website work properly
                        </div>
                        </AdBlockDetect>
                        */}
                            <div className="input-group" id="input">
                                <div className="input-group-prepend">
                                    <Button nightMode={ nightMode }
                                           id="test" name="test" value="TEST" onClick={ this.listenerTestButton }
                                           disabled={loading}/>
                                </div>
                                <input type="text" className={`form-control ${invalidURL ? 'is-invalid' : ''}`}
                                       id="videoURL" name="videoURL" onChange={ this.listenerForm }
                                       value={ youtubeVideoURL } placeholder="insert here your youtube video url..."
                                       disabled={loading}/>
                            </div>
                            <div className="row justify-content-center">
                                <div className="btn-group mt-3">
                                    <Button nightMode={ nightMode }
                                           id="test" name="Play Song" value="Play Now!" onClick={ this.playSong }
                                           disabled={(loading || invalidURL || youtubeVideoURL.length === 0) && playQueue.values.length < 1}/>
                                    <Button nightMode={ nightMode }
                                           id="test" name="Add to Queue" value="Enqueue" onClick={ this.addToQueue }
                                           disabled={loading || invalidURL || youtubeVideoURL.length === 0}/>
                                    <Button nightMode={ nightMode }
                                           id="test" name="Clear queueue" value="Clear Queue" onClick={ this.clear }
                                           disabled={loading || playQueue.values.length < 2}/>
                                </div>
                            </div>
                            <NowPlayingText title={youtubeVideoTitle} currentFormat={currentFormat} />
                            { this.state.youtubeAudioURL ?
                                <audio id="player" className="player" controls src={ youtubeAudioURL } onError={ this.onSongError }
                                       onTimeUpdate={ this.titleProgress } ref={this.audioRef} onEnded={ this.onSongEnd }
                                       onPlay={this.onPlay} onPause={this.onPause} /> : null
                            }
                        </div>
                    </div>
                    <PlayQueueList showing={ showingQueue } playQueue={ this.state.playQueue }/>
                    <SearchPanel showing={ showingSearch } onPlayClicked={ this.playFromSeach } onEnqueueClicked={ this.enqueueFromSeach } />
                    <PlayQueueListButton onClick={ this.showQueue } showingQueue={ showingQueue } nightMode={ nightMode } left={ showingQueue || showingSearch } />
                    <SearchButton onClick={ this.showSearch } showingSearch={ showingSearch } nightMode={ nightMode } left={ showingQueue || showingSearch } />
                </div>

                <Footer />
            </div>
        );
    }
}

//Decorador que permite que un componente se muestre o no cuando
//una propiedad (`prop') existe.
const ShowIf = (name, func) => {
    return props => {
        if(props[name]) {
            return func(props);
        } else {
            return null;
        }
    }
}

const Button = props => {
    let lprops = {...props};
    delete lprops.nightMode;
    return <input type="button" className={`btn btn-outline-${ props.nightMode ? 'light' : 'dark' }`} {...lprops} />;
};

const LoadingSpinner = () => (
    <div className="row justify-content-center">
        <div className="title loading" id="stateText">
            Loading...
        </div>
        <div className="loader"/>
    </div>
);

const NowPlayingText = ShowIf('title', ({ title, currentFormat }) => (
    <div className="title" id="stateText">
        <div id="NowPlaying">
            Now Playing: ({ currentFormat })
        </div>
        <div id="title" className="text-center"> { title } </div>
    </div>
));

const Header = ({ nightMode, nightModeListener, lastfm }) => (
    <header className="AppHeader" id="AppHeader">
        <h1 className="App-title">YouTube Audio Player</h1>
        <button className="btn btn-sm btn-outline-light float-right onoffmode" id="changeSkinButton" onClick={ nightModeListener }>
            { !nightMode ? <i className="material-icons">brightness_2</i> : <i className="material-icons">wb_sunny</i>}
        </button>
        <button className="btn btn-sm btn-outline-light float-right lastfm" onClick={ () => !lastfm.hasLoggedIn ? lastfm.startAuthentication() : lastfm.deauthenticate() }>
            <img src="https://www.last.fm/static/images/footer_logo@2x.49ca51948b0a.png" width={ 24 } alt={ lastfm.username } />
            { lastfm.hasLoggedIn && <i className="material-icons"
                                       style={{ position: 'absolute', top: 0, left: 0, fontSize: 34, marginLeft: 1, color: 'rgb(255, 180, 180)' }}>close</i>}
        </button>
    </header>
);

const Footer = () => (
    <footer className="AppFooter footer align-items-center" id="AppFooter">
        <div id="FooterContent">
            <a href="https://github.com/MajorcaDevs/youtubeAudio" target="_blank" rel="noopener noreferrer">
                <img alt="GitHub" src={github} id="githubLogo" className="mr-1" />
                &nbsp;Made by <b>MajorcaDevs</b> with <b>{"<3"}</b>
            </a>
        </div>
    </footer>
);

const NotifContent = ({ title, text, light }) => (
    <div>
        <p className="lead">{ title }</p>
        <p className={light ? "text-light" : "text-muted"}><small>{ text }</small></p>
    </div>
);

const PlayQueueListButton = ({ showingQueue, nightMode, onClick, left }) => (
    <Spring from={{ right: 15 }}
            to={{ right: left ? Math.min(-PlayQueueList._right + 15, document.body.clientWidth - 45) : 15 }}>
        { styles =>
            <button id="playQueue"
                    style={ styles }
                    className={`btn ${showingQueue ? 'right' : 'left'} btn-outline-${ nightMode ? 'light' : 'dark' }`}
                    onClick={ onClick }>
                <div id="arrow" className={`${showingQueue ? 'right' : 'left'}`}/>
            </button>
        }
    </Spring>
);

const SearchButton = ({ showingSearch, nightMode, onClick, left }) => (
    <Spring from={{ right: 15 }}
            to={{ right: left ? Math.min(-SearchPanel._right + 15, document.body.clientWidth - 45) : 15 }}>
        { styles =>
            <button id="searchPanelButton"
                    style={ styles }
                    className={`btn ${showingSearch ? 'right' : 'left'} btn-outline-${ nightMode ? 'light' : 'dark' }`}
                    onClick={ onClick }>
                <i className="material-icons">search</i>
            </button>
        }
    </Spring>
);

class LoadingToastController {
    constructor() {
        this._toast = toast(<LoadingSpinner />, { autoClose: false, closeOnClick: false, closeButton: false });
    }

    success(title, content) {
        toast.update(this._toast, {
            type: toast.TYPE.DEFAULT,
            render: <NotifContent title={ title } light={false} text={ content } />,
            autoClose: 4000,
            closeButton: null,
            closeOnClick: true,
        });
    }

    error(title, content) {
        toast.update(this._toast, {
            render: <NotifContent title='Video not found' light={true}
                                  text='Check that the video URL exists or is complete.' />,
            type: toast.TYPE.ERROR,
            closeButton: null,
            closeOnClick: true,
        });
    }

    dismiss() {
        toast.dismiss(this._toast);
    }
}

export default App;
