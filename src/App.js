import React, { Component } from 'react';
import $ from 'jquery';
import { ToastContainer, toast, style } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.css';
import 'material-design-icons/iconfont/material-icons.css';
import './styles/App/App.css';
import github from './github.svg';
import PlayQueue from './PlayQueue';
import keys from './keys.json';
import PlayQueueList from './PlayQueueList';
import { Lastfm, parseTitle } from './LastFM';
// import AdBlockDetect from 'react-ad-block-detect';

const { GOOGLE_API_KEY } = keys;

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
            youtubePlaylistID: "",
            compatibility: this.checkFormats(),
            playQueue: new PlayQueue(),
            scrobblingState: 'none', // 'none', 'nowPlaying', 'scrobbled'
        });
        this.audioRef = React.createRef();
        this.lastfm = new Lastfm(); window.xd = () => this.lastfm.startAuthentication(); window.xD = v => this.lastfm.disableScrobblings = !!v;
        this.listenerTestButton = this.listenerTestButton.bind(this);
        this.nightModeListener = this.nightModeListener.bind(this);
        this.onWindowKeyDown = this.onWindowKeyDown.bind(this);
        this.titleProgress = this.titleProgress.bind(this);
        this.listenerForm = this.listenerForm.bind(this);
        this.onSongError = this.onSongError.bind(this);
        this.addToQueue = this.addToQueue.bind(this);
        this.showQueue = this.showQueue.bind(this);
        this.onSongEnd = this.onSongEnd.bind(this);
        this.playSong = this.playSong.bind(this);
        this.clear = this.clear.bind(this);
    }

    _testYoutubeVideoURL = "https://www.youtube.com/watch?v=bM7SZ5SBzyY";

    clear(){
        this.setState({playQueue: this.state.playQueue.emptyQueue()});
    }

    addToQueue(){
        let newState = {};
        if(this.state.youtubeVideoID) {
            newState.loading = true;
            $.ajax({
                async: true,
                type: "GET",
                url: "https://yt-audio-api.herokuapp.com/api/" + this.state.youtubeVideoID,
                success: (response) => {
                    this.setState({
                        loading: false,
                        playQueue: this.state.playQueue.add({
                            id: this.state.youtubeVideoID,
                            title: response.title
                        })
                    }, () => {
                        if (this.state.playQueue.values.length && !this.state.youtubeAudioURL){
                            this.selectBestOption(this.state.playQueue.values[0].id);
                        } else {
                            toast.success(<NotifContent title='Enqueued'
                                                        text={`"${response.title}" was added to the queue`} />,
                                          { autoClose: 4000 });
                        }
                    });
                },
                error: () => {
                    this.setState({ loading: false })
                    toast.error(<NotifContent title='Video not found'
                                              text='Check that the video URL exists or is complete' />
                    );
                }
            });
        } else if(this.state.youtubePlaylistID) {
            newState.loading = true;
            this.addYoutubePlaylist();
        }
        this.setState(newState);
    }

    playSong(){
        this.setState({
            playQueue: !this.state.youtubeVideoID ? this.state.playQueue : this.state.playQueue.addFirst({
                id: this.state.youtubeVideoID,
                title: null
            })
        });
        if (this.state.youtubeVideoID) {
            this.selectBestOption(this.state.youtubeVideoID, true);
        } else if(this.state.youtubePlaylistID) {
            this.addYoutubePlaylist(true);
        } else if(this.state.playQueue.values.length > 0 && this.state.youtubeVideoURL) {
            this.selectBestOption(this.state.playQueue.values[0].id);
        }
    }

    addYoutubePlaylist(startPlaying = false, nextId = null) {
        this.setState({ loading: true });
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=id,snippet&maxResults=50&playlistId=${this.state.youtubePlaylistID}&key=${GOOGLE_API_KEY}`;
        if(nextId) url += `&pageToken=${nextId}`;
        $.ajax({
            url,
            async: true,
            type: 'GET',
            success: response => {
                this.setState({
                    loading: !!response.nextToken,
                    playQueue: this.state.playQueue.add(...response.items.map(item => ({ id: item.snippet.resourceId.videoId, title: item.snippet.title })))
                }, () => {
                    if(this.state.playQueue.values.length > 0) {
                        this.setState({
                            youtubeVideoID: this.state.playQueue.values[0].id,
                            youtubeVideoTitle: this.state.playQueue.values[0].title
                        });
                        this.selectBestOption(this.state.playQueue.values[0].id, startPlaying);
                    }
                });
                if(response.nextPageToken) {
                    this.addYoutubePlaylist(startPlaying, response.nextPageToken);
                }
            },
            error: () => {
                this.setState({ loading: false })
                toast.error(<NotifContent title='Cannot load videos from playlist'
                                          text='Something bad has happened while we were asking to YouTube for the videos in that playlist :(' />
                );
            }
        })
    }

    checkFormats(){
        let a = document.createElement("audio");
        return ({
            opus: ((a.canPlayType("audio/webm; codecs=opus")) !== ""),
            vorbis: ((a.canPlayType("audio/webm; codecs=vorbis")) !== ""),
            m4a: ((a.canPlayType("audio/x-m4a; codecs=mp4a.40.2")) !== "")
        });
    }

    listenerTestButton(event){
        event.preventDefault();
        this.setState({youtubeVideoURL: this._testYoutubeVideoURL});
        this.selectBestOption(this.getYoutubeVideoID(this._testYoutubeVideoURL));
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
        $("title").text("YouTube Audio");
    }

    selectBestOption(youtubeVideoID, autoplay = false) {
        setTimeout(() => this.setState({ loading: true }));
        $.ajax({
            async: true,
            type: "GET",
            url: "https://yt-audio-api.herokuapp.com/api/" + youtubeVideoID + "/formats",
            success: (response) => {
                response = response
                    .filter(e => this.state.compatibility.m4a && e.container === 'm4a')
                    .concat(response.filter(e => this.state.compatibility.vorbis && e.extra.startsWith('vorbis')))
                    .concat(response.filter(e => this.state.compatibility.opus && e.extra.startsWith('opus')));
                if(response.length === 0){
                    this.setState({ loading: false });
                    toast.error(<NotifContent title='No compatible sources for your browser'
                                              text={'We could not find any compatible sources for your browser. It seems ' +
                                                    'that your browser doesn\'t support neither Opus, Vorbis nor AAC.'} />,
                                { autoClose: false }
                    );
                    return;
                }
                response.forEach(e => {
                    let bits = e.extra.split(/[\s@k]+/g);
                    e.codec = bits[0]; e.bitrate = parseInt(bits[1], 10);
                    if (e.codec !== "vorbis" && e.codec !== "opus")
                        e.codec = "m4a";
                });
                response.sort(this.predicateBy("bps", true));
                this.setState({
                    currentFormat: response[0].codec + "@~" + (response[0].bitrate ? response[0].bitrate : response[0].bps) + "kbps",
                    qualityFromAudio: response[0].id
                });
                this.loadAudioURL(youtubeVideoID, response[0].id, autoplay);
            },
            error: () => {
                this.setState({ loading: false, youtubeAudioURL: "", youtubeVideoTitle: "" })
                toast.error(<NotifContent title='Video not found'
                                          text='Check that the video URL exists or is complete.' />
                );
            }
        });
    }

    predicateBy(prop, desc){
        return (a,b) => {
            if (a[prop] > b[prop])
                return desc ? -1 : 1;
            else if(a[prop] < b[prop])
                return desc ? 1 : -1;
            else
                 return 0;
        }
    }

    loadAudioURL(youtubeVideoID, formatID, autoplay = false) {
        $.ajax({
            async: true,
            type: "GET",
            url: "https://yt-audio-api.herokuapp.com/api/" + youtubeVideoID + "/" + formatID,
            success: (response) => {
                this.setState({
                    youtubeAudioURL: response.url,
                    youtubeVideoTitle: response.title,
                    loading: false,
                    scrobblingState: 'none'
                }, () => {
                    if(autoplay) {
                        this.audioRef.current.oncanplay = e => {
                            this.audioRef.current.play().catch(reason => toast.info(
                                <NotifContent title='Press play manually'
                                              text={'Due to your browser configuration, we cannot press play for you.' +
                                                    ' You can change your autoplay options in the browser\'s configuration.'} />
                            ));
                            this.audioRef.current.oncanplay = null;
                        };
                    }
                });
                $("title").text(this.state.youtubeVideoTitle + " - YouTube Audio");
            },
            error: () => {
                this.setState({ loading: false, youtubeAudioURL: "", youtubeVideoTitle: "" });
                toast.error(<NotifContent title='Video not found'
                                          text='Check that the video URL exists or is complete.' />
                );
            }
        });
    }

    getYoutubeVideoID(url){
        let youtubeVideoID =
            /(?:(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\/?\?v=(.+))|(?:(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+))/
                .exec(url);
        if (youtubeVideoID !== null)
            return youtubeVideoID[1] || youtubeVideoID[2];
        else
            this.setState({loading: false});
        return null;
    }

    getPlaylistID(url) {
        let youtubePlaylistID = /playlist\?list=([A-Za-z0-9-_]+)/g.exec(url);
        if(youtubePlaylistID !== null) {
            return youtubePlaylistID[1]
        }
        return null;
    }

    nightModeListener(event){
        event.preventDefault();
        this.setState({ nightMode: !this.state.nightMode });
    }

    titleProgress(event){
        const currentTime = event.target.currentTime;
        let duration = event.target.duration;
        let time = Math.round(currentTime);
        let seconds = time - (Math.floor(time/60)*60);
        time = Math.floor(time/60) + ":" + (seconds < 10 ? "0"+seconds : seconds);
        $("title").text(time + " - " + this.state.youtubeVideoTitle + " - YouTube Audio");

        if(navigator.userAgent.indexOf('Safari/') !== -1) {
            //Workaround for Safari m4a playing bug
            duration /= 2;
        }

        if(this.lastfm.hasLoggedIn) {
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
            } else if(this.state.scrobblingState === 'nowPlaying' && currentTime >= Math.min(duration, 240)) {
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
            console.log("FORCE NEXT");
            this.onSongEnd(null);
        }
    }

    onSongEnd(event) {
        this.setState({ playQueue: this.state.playQueue.deleteFirst(), scrobblingState: 'none' }, () => {
            if (this.state.playQueue.values.length > 0) {
                this.selectBestOption(this.state.playQueue.values[0].id, true);
            }
        });
    }

    onSongError(event) {
        console.log(event.target.error.code);
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
                youtubeAudioURL: `https://yt-audio-api.herokuapp.com/api/${youtubeVideoID}/${qualityFromAudio}/passthrough`
            });
            break;
        }

        default: return;
        }
    }

    showQueue(event) {
        event.preventDefault();
        this.setState({showingQueue: !this.state.showingQueue});
    }

    onWindowKeyDown(event) {
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
        window.addEventListener('keydown', this.onWindowKeyDown);
    }

    componentDidUpdate(prevProps, prevState) {
        if(!prevState.loading && this.state.loading) {
            this.loadingToast = toast(<LoadingSpinner />, { autoClose: false, closeOnClick: false });
        } else if(prevState.loading && !this.state.loading) {
            toast.dismiss(this.loadingToast);
            this.loadingToast = undefined;
        }
    }

    render() {
        const { youtubeVideoURL, invalidURL, youtubeVideoTitle, youtubeAudioURL, loading, nightMode,
            showingQueue, currentFormat, playQueue } = this.state;
        if(nightMode) $('body').addClass('AppDark').removeClass('AppLight');
        else $('body').removeClass('AppDark').addClass('AppLight');
        return (
            <div id="AppContainer">
                <Header nightMode={ nightMode } nightModeListener={ this.nightModeListener } />
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
                                           disabled={loading}/>
                                    <Button nightMode={ nightMode }
                                           id="test" name="Add to Queue" value="Enqueue" onClick={ this.addToQueue }
                                           disabled={loading}/>
                                    <Button nightMode={ nightMode }
                                           id="test" name="Clear queueue" value="Clear Queue" onClick={ this.clear }
                                           disabled={loading || playQueue.values.length < 2}/>
                                </div>
                            </div>
                            <NowPlayingText title={youtubeVideoTitle} currentFormat={currentFormat} />
                            { this.state.youtubeAudioURL ?
                                <audio id="player" className="player" controls src={ youtubeAudioURL } onError={ this.onSongError }
                                       onTimeUpdate={ this.titleProgress } ref={this.audioRef} onEnded={ this.onSongEnd } /> : null
                            }
                            <PlayQueueList showing={ showingQueue } playQueue={ this.state.playQueue }/>
                        </div>
                    </div>
                    <button id="playQueue" className={`btn ${showingQueue ? 'right' : 'left'} btn-outline-${ nightMode ? 'light' : 'dark' }`}
                            onClick={ this.showQueue }>
                        <div id="arrow" className={`${showingQueue ? 'right' : 'left'}`}/>
                    </button>
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

const Header = ({ nightMode, nightModeListener }) => (
    <header className="AppHeader" id="AppHeader">
        <h1 className="App-title">YouTube Audio Player</h1>
        <button className="btn btn-sm btn-outline-light float-right onoffmode" id="changeSkinButton" onClick={ nightModeListener }>
            { !nightMode ? <i className="material-icons">brightness_2</i> : <i className="material-icons">wb_sunny</i>}
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

const NotifContent = ({ title, text }) => (
    <div>
        <p className="lead">{ title }</p>
        <p className="text-muted"><small>{ text }</small></p>
    </div>
);

export default App;
