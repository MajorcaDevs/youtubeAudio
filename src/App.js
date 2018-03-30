import React, { Component } from 'react';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import github from './github.svg';

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
            error: false,
            nightMode: true,
            currentFormat: "",
            compatibility: this.checkFormats()
        });
        this.listenerForm = this.listenerForm.bind(this);
        this.listenerTestButton = this.listenerTestButton.bind(this);
        this.nightModeListener = this.nightModeListener.bind(this);
        this.titleProgress = this.titleProgress.bind(this);
    }

    _testYoutubeVideoURL = "https://www.youtube.com/watch?v=bM7SZ5SBzyY";

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
        if (youtubeVideoID !== null){
            newState.invalidURL = false;
            this.selectBestOption(youtubeVideoID);
        } else {
            newState.invalidURL = url.length !== 0;
        }
        this.setState(newState);
        $("title").text("YouTube Audio");
    }

    selectBestOption(youtubeVideoID) {
        setTimeout(() => this.setState({ loading: true, error: false }));
        $.ajax({
            async: true,
            type: "GET",
            url: "https://yt-audio-api.herokuapp.com/api/" + youtubeVideoID + "/formats",
            success: (response) => {
                response = response
                    .filter(e => this.state.compatibility.m4a && e.extra.startsWith('m4a'))
                    .concat(response.filter(e => this.state.compatibility.vorbis && e.extra.startsWith('vorbis')))
                    .concat(response.filter(e => this.state.compatibility.opus && e.extra.startsWith('opus')));
                response.forEach(e => {
                    var bits = e.extra.split(/[\s@k]+/g);
                    if (e.extra.startsWith("m4a")){
                        bits[0] = "m4a"; e.codec = "m4a"; e.bitrate = 128;
                    } else {
                        e.codec = bits[0]; e.bitrate = parseInt(bits[1], 10);
                    }
                    switch (bits[0]){
                        case "opus": e.preference = 1; break;
                        case "vorbis": e.preference = 2; break;
                        case "m4a": e.preference = 3; break;
                        default: break;
                    }
                });
                response.sort(this.predicateBy("bitrate", true));
                response.sort(this.predicateBy("preference"));
                this.setState({ currentFormat: response[0].codec + "@" + response[0].bitrate + "k" });
                this.loadAudioURL(youtubeVideoID, response[0].id);
            },
            error: () => this.setState({ loading: false, youtubeAudioURL: "", youtubeVideoTitle: "", error: true })
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

    loadAudioURL(youtubeVideoID, formatID) {
        $.ajax({
            async: true,
            type: "GET",
            url: "https://yt-audio-api.herokuapp.com/api/" + youtubeVideoID + "/" + formatID,
            success: (response) => {
                this.setState({youtubeAudioURL: response.url, youtubeVideoTitle: response.title, loading: false});
                $("title").text(this.state.youtubeVideoTitle + " - YouTube Audio");
            },
            error: () => this.setState({ loading: false, youtubeAudioURL: "", youtubeVideoTitle: "", error: true })
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

    nightModeListener(event){
        event.preventDefault();
        this.setState({ nightMode: !this.state.nightMode });
    }

    titleProgress(event){
        let time = Math.round(event.target.currentTime);
        let seconds = time - (Math.floor(time/60)*60);
        time = Math.floor(time/60) + ":" + (seconds < 10 ? "0"+seconds : seconds);
        $("title").text(time + " - " + this.state.youtubeVideoTitle + " - YouTube Audio");
    }

    render() {
        const { youtubeVideoURL, invalidURL, youtubeVideoTitle, youtubeAudioURL, loading, error, nightMode, currentFormat } = this.state;
        return (
            <div className={`${nightMode ? 'AppDark' : 'AppLight'} fill`} id="AppContainer">
                <header className={`${nightMode ? 'App-headerDark' : 'App-headerLight'}`} id="AppHeader">
                    <h1 className="App-title">YouTube Audio Player</h1>
                    <button className="btn btn-outline-light" id="changeSkinButton" onClick={ this.nightModeListener }>
                        { !nightMode ? "Night Mode" : "Day mode"}
                    </button>
                </header>
                <div className="container-fluid">
                    <h5 id="title">Enter Youtube video Link</h5>
                    <p id="greyText">Enjoy the audio from the youtube videos!</p>
                    <div className="d-flex row justify-content-center align-items-center" id="audioQuery">
                        <div className="col-md-6 col-sm-12">
                            <div className="input-group" id="input">
                                <div className="input-group-prepend">
                                    <input type="button" className="input-group-text btn btn-outline-dark"
                                           id="test" name="test" value="TEST" onClick={ this.listenerTestButton }
                                           disabled={loading}/>
                                </div>
                                <input type="text" className={`form-control ${invalidURL ? 'is-invalid' : ''}`}
                                       id="videoURL" name="videoURL" onChange={ this.listenerForm }
                                       value={ youtubeVideoURL } placeholder="insert here your youtube video url..."
                                       disabled={loading}/>
                            </div>
                            <div className="alert alert-danger" id="alert" role="alert">
                            </div>
                            { loading ?
                                <div className="title" id="NP">
                                    Loading...
                                </div> : null
                            }
                            { error ?
                                <div className="title" id="NP">
                                    Video not found...
                                </div> : null
                            }
                            { this.state.youtubeVideoTitle ?
                                <div className="title" id="NP">
                                    <div id="NowPlaying">
                                        Now Playing: ({ currentFormat })
                                    </div>
                                    <div id="title" className="text-center"> { youtubeVideoTitle } </div>
                                </div> : null
                            }
                            { this.state.youtubeAudioURL ?
                                <audio id="player" className="player" controls src={ youtubeAudioURL }
                                       onTimeUpdate={ this.titleProgress } /> : null
                            }
                        </div>
                    </div>
                </div>
                <footer className={`${nightMode ? 'App-footerDark' : 'App-footerLight'}`} id="AppFooter">
                    <div className={`${nightMode ? 'App-footerDark' : 'App-footerLight'} row`} id="FooterContentGit">
                        <a href="https://github.com/RaulWhite/youtubeAudio" target="_blank" rel="noopener noreferrer"
                            className="col-4">
                            <img alt="GitHub" src={github} id="githubLogo" className={!nightMode ? "githubDay" : null}/>
                            &nbsp;GitHub repository
                        </a>
                        <div className={`${nightMode ? 'App-footerDark' : 'App-footerLight'} col-4`} id="FooterContent">
                            Uses <a href="https://github.com/melchor629/youtubedl-audio-api"
                                    target="_blank" rel="noopener noreferrer">YoutubeDL audio API</a>
                        </div>
                        <div className={`${nightMode ? 'App-footerDark' : 'App-footerLight'} col-4`} id="FooterContent">
                            Made by:&nbsp;
                            <a href="https://github.com/raulwhite" target="_blank" rel="noopener noreferrer">
                                Raul White
                            </a>,&nbsp;
                            <a href="http://alkesst.github.io" target="_blank" rel="noopener noreferrer">
                                Alkesst
                            </a>&nbsp;&amp;&nbsp;
                            <a href="http://melchor9000.me" target="_blank" rel="noopener noreferrer">
                                Melchor9000
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
}
export default App;
