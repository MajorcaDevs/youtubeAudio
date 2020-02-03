import md5 from 'blueimp-md5';
import { LASTFM_API_KEY, LASTFM_SECRET } from './keys';

export const parseTitle = (text) => {
    text = text.replace(/(?:official )?(?:lyric )?(?:video|audio)/gi, '')
        .replace(/[ ([]?hq[)\] ]?/gi, '[-]')
        .replace(/[ ([]?hd[)\] ]?/gi, '[-]')
        .replace(/[AB] ?\d/, '')
        .replace(/\( *\)/g, '')
        .replace(/\[ *\]/g, '')
        .trim();
    const isChunguillo = /.+ - .+ - .+/.exec(text) !== null;
    const parts = /([a-záéíóúàèìòùäëïöüâêîôûç_0-9&./',\- ]+) - ([a-záéíóúàèìòùäëïöüâêîôûç_0-9&./',\- ()]+)/i.exec(text);
    if(parts !== null && !isChunguillo) {
        return {
            title: parts[2].trim(),
            artist: parts[1].trim()
        };
    }

    if(!isChunguillo) {
        const parts = /([a-záéíóúàèìòùäëïöüâêîôûç_0-9&./',\- ]+) (?:'|‘)([a-záéíóúàèìòùäëïöüâêîôûç_0-9&./',\- ()]+)(?:'|’)/i.exec(text);
        if(parts !== null) {
            return {
                title: parts[2].trim(),
                artist: parts[1].trim()
            };
        }
    }

    if(isChunguillo) {
        const pieces = text.split(' - ');
        return {
            title: pieces.slice(1).join(' - '),
            artist: pieces[0],
        };
    }

    return null;
};

export class Lastfm {
    static baseUrl = 'https://ws.audioscrobbler.com/2.0/';
    _userToken = null;
    _userName = null;
    _disableScrobblings = false;

    constructor() {
        let query = window.location.search.substr(1).split('&').map(e => e.split('=')).reduce((x, e) => {
            x[e[0]] = e[1];
            return x;
        }, {});
        if(window.localStorage.getItem('lastfm')) {
            const { userToken, userName, disableScrobblings } = JSON.parse(window.localStorage.getItem('youtubeaudio:lastfm'));
            this._userToken = userToken;
            this._userName = userName;
            this._disableScrobblings = disableScrobblings;
        } else if(query.token) {
            this._makeRequest('get', { method: 'auth.getSession', 'token': query.token })
                .then(json => {
                    this._userToken = json.session.key;
                    this._userName = json.session.name;
                    window.localStorage.setItem('lastfm', JSON.stringify({
                        userToken: this._userToken,
                        userName: this._userName,
                        disableScrobblings: this._disableScrobblings,
                    }));
                });
        }
    }

    get hasLoggedIn() {
        return this._userToken;
    }

    get username() {
        return this._userName;
    }

    get disableScrobblings() {
        return this._disableScrobblings;
    }

    set disableScrobblings(value) {
        this._disableScrobblings = value;
        window.localStorage.setItem('youtubeaudio:lastfm', JSON.stringify({
            ...JSON.parse(window.localStorage.getItem('youtubeaudio:lastfm')),
            disableScrobblings: this._disableScrobblings,
        }));
    }

    startAuthentication() {
        const currentUrl = window.location.toString();
        window.location.assign(`http://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&cb=${encodeURIComponent(currentUrl)}`);
    }

    deauthenticate() {
        window.localStorage.removeItem('youtubeaudio:lastfm');
        window.location.reload();
    }

    updateNowPlaying(metadata) {
        if(metadata.title && metadata.artist && !this._disableScrobblings) {
            return this._makeRequest('post', {
                track: metadata.title,
                artist: metadata.artist,
                duration: Math.trunc(metadata.duration),
                method: 'track.updateNowPlaying'
            });
        } else {
            return Promise.resolve({});
        }
    }

    scrobble(metadata) {
        if(metadata.title && metadata.artist && !this._disableScrobblings) {
            return this._makeRequest('post', {
                track: metadata.title,
                artist: metadata.artist,
                duration: Math.trunc(metadata.duration),
                timestamp: Math.trunc((+metadata.timestamp) / 1000),
                method: 'track.scrobble'
            });
        } else {
            return Promise.resolve({});
        }
    }

    async _makeRequest(method, params, requiresSignature = true) {
        let mParams = params instanceof Map ? Object.fromEntries(params.entries()) : Object.entries(params);
        mParams.api_key = LASTFM_API_KEY;
        if(this._userToken) {
            mParams.sk = this._userToken;
        }
        mParams.api_sig = this._signature(mParams);
        mParams.format = 'json';

        const query = Object.entries(mParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        method = method.toLowerCase();
        if(method === 'get') {
            const res = await fetch(`${Lastfm.baseUrl}?${query}`);
            return res.json();
        } else if(method === 'post') {
            const headers = new Headers();
            headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
            const res = await fetch(Lastfm.baseUrl, { method: 'POST', body: query, headers });
            return res.json();
        } else {
            throw new Error('Unsupported method: ' + method);
        }
    }

    _signature(params) {
        const sig = Object.entries(params)
            .sort(([a], [b]) => a.key.localeCompare(b.key))
            .map(([key, value]) => key + value)
            .reduce((prev, value) => prev + value, '')
            + LASTFM_SECRET;
        return md5(sig);
    }
}