import React, { Component } from 'react';
import $ from 'jquery';
import { ToastContainer, toast } from 'react-toastify';
import bowser from 'bowser';

import {
    Button,
    Footer,
    Header,
    LoadingSpinner,
    NowPlayingText,
    PlayQueueList,
    PlayQueueListButton,
    SearchButton,
    SearchPanel,
} from './components';
import { NightModeProvider } from './hooks/night-mode';
import PlayQueue from './PlayQueue';
import { Lastfm, parseTitle } from './LastFM';
import { selectBestOption, loadAudioURL, addYoutubePlaylist, getPassthroughUrl } from './api';

import './styles/vendors.scss';
import './styles/App/App.scss';
// import AdBlockDetect from 'react-ad-block-detect';

//TODO Averigüar como arreglarlo ahora, parece que hay que usar CSS
/*style({
    TOP_RIGHT: {
        top: '80px',
        right: '1em'
    }
});*/

class App extends Component {
    constructor (props) {
        super(props);
        this.state = ({
            youtubeVideoURL: '',
            qualityFromAudio: 0,
            invalidURL: false,
            youtubeAudioURL: '',
            youtubeVideoTitle: '',
            loading: false,
            nightMode: true,
            currentFormat: '',
            youtubeVideoID: '',
            showingQueue: false,
            showingSearch: false,
            youtubePlaylistID: '',
            playQueue: new PlayQueue(),
            isPlaying: false,
            scrobblingState: 'none', // 'none', 'nowPlaying', 'scrobbled'
        });
        this.audioRef = React.createRef();
        this.lastfm = new Lastfm(); window.xD = v => this.lastfm.disableScrobblings = !!v;
        this.onPlaylistItemReorder = this.onPlaylistItemReorder.bind(this);
        this.onPlaylistItemRemove = this.onPlaylistItemRemove.bind(this);
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
        this.nextSong = this.nextSong.bind(this);
        this.onPause = this.onPause.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.clear = this.clear.bind(this);
    }

    _testYoutubeVideoURL = 'https://www.youtube.com/watch?v=bM7SZ5SBzyY';

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
                        this.loadingToast.success('Enqueued', `"${title}" was added to the queue`);
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
    async loadSong(youtubeVideoID, autoplay = false) {
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
                $('title').text(`${this.state.youtubeVideoTitle} - YouTube Audio`);
                if(autoplay) {
                    this.audioRef.current.oncanplay = async () => {
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
            this.setState({ loading: false, youtubeAudioURL: '', youtubeVideoTitle: '' });
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
            $('title').text('YouTube Audio');
        }
    }

    /**
     * Tests whether the URL is a YouTube video and extract the video ID from it.
     * @param {string} url URL to test
     * @returns String|null the YouTube video ID if the URL is valid, or null otherwise
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
     * @returns Object|null the YouTube playlist ID if the URL is valid, or null otherwise
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
     * @returns Object A JS Object that represents the query
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
     * @returns string The time formated
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

    titleProgress(){
        const currentTime = this.audioRef.current.currentTime;
        let duration = this.audioRef.current.duration;
        let time = this.formatTime(currentTime);
        $('title').text(`${this.state.isPlaying ? '▶' : '▮▮'} ${time} - ${this.state.youtubeVideoTitle} - YouTube Audio`);

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

    onSongEnd() {
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
                youtubeAudioURL: getPassthroughUrl(youtubeVideoID, qualityFromAudio)
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

    nextSong(event) {
        event.preventDefault();
        this.onSongEnd();
    }

    onPlaylistItemReorder(startIndex, endIndex) {
        const playQueue = this.state.playQueue.reorder(startIndex, endIndex);
        this.setState({
            playQueue
        });
    }

    onPlaylistItemRemove(element) {
        const playQueue = this.state.playQueue.delete(element);
        this.setState({
            playQueue
        });
    }

    onWindowKeyUp(event) {
        if(event.code === 'Space' && event.target.getAttribute('id') !== 'videoURL') {
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

        //TODO Force redirect people from old place to the new one :)
        if(window.location.hostname === 'majorcadevs.github.io') {
            toast.info(<p>We've change the location to
                <a href="https://youtubeAudio.majorcadevs.com">https://youtubeAudio.majorcadevs.com</a>.
                <small>We'll redirect you to the new location when this notification is closed :)</small>
            </p>, { onClose: () => window.location.assign('https://youtubeAudio.majorcadevs.com'), autoClose: 10000 });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(!prevState.loading && this.state.loading) {
            this.loadingToast = new LoadingToastController();
        }

        if(prevState.isPlaying !== this.state.isPlaying){
            $('title').text(
                `${this.state.isPlaying ? '▶' : '▮▮'}
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
                <NightModeProvider>
                    <Header lastfm={ this.lastfm } />

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
                                        <Button
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
                                        <Button
                                            name="Play Song" value="Play Now!" onClick={ this.playSong }
                                            disabled={(loading || invalidURL || youtubeVideoURL.length === 0) && playQueue.values.length < 1}/>
                                        <Button
                                            name="Add to Queue" value="Enqueue" onClick={ this.addToQueue }
                                            disabled={loading || invalidURL || youtubeVideoURL.length === 0}/>
                                        <Button
                                            name="Clear queueue" value="Clear Queue" onClick={ this.clear }
                                            disabled={loading || playQueue.values.length < 2}/>
                                        <Button
                                            name="Next song" value="Next Song" onClick={ this.nextSong }
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
                        <PlayQueueList showing={ showingQueue }
                            playQueue={ this.state.playQueue }
                            onPlaylistItemReorder={ this.onPlaylistItemReorder }
                            onPlaylistItemRemove={ this.onPlaylistItemRemove } />
                        <SearchPanel showing={ showingSearch } onPlayClicked={ this.playFromSeach } onEnqueueClicked={ this.enqueueFromSeach } />
                        <PlayQueueListButton onClick={ this.showQueue } showingQueue={ showingQueue } nightMode={ nightMode } left={ showingQueue || showingSearch } />
                        <SearchButton onClick={ this.showSearch } showingSearch={ showingSearch } nightMode={ nightMode } left={ showingQueue || showingSearch } />
                    </div>

                    <Footer />
                </NightModeProvider>
            </div>
        );
    }
}


const NotifContent = ({ title, text, light }) => (
    <div>
        <p className="lead">{ title }</p>
        <p className={light ? 'text-light' : 'text-muted'}><small>{ text }</small></p>
    </div>
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
