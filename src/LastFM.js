import md5 from 'blueimp-md5';
import keys from './keys.json';

import { doTest } from './lastfm.parseTitle.test';

Map.prototype.map = function map(func) {
    let mapped = [];
    this.forEach((value, key) => mapped.push(func(value, key)));
    return mapped;
}

Map.prototype.sort = function sort(func) {
    return new Map([...this.entries()].sort((a, b) => func({ key: a[0], value: a[1] }, { key: b[0], value: b[1] })));
}

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
    } else {
        return null;
    }
};

if(process.env.NODE_ENV !== 'production') {
    doTest();
}

export class Lastfm {
    static baseUrl = 'http://ws.audioscrobbler.com/2.0/';
    _userToken = null;
    _userName = null;

    constructor() {
        let query = window.location.search.substr(1).split("&").map(e => e.split("=")).reduce((x, e) => {
            x[e[0]] = e[1];
            return x;
        }, {});
        if(window.localStorage.getItem('lastfm')) {
            const { userToken, userName } = JSON.parse(window.localStorage.getItem('lastfm'));
            this._userToken = userToken;
            this._userName = userName;
        } else if(query.token) {
            this._makeRequest('get', { method: 'auth.getSession', 'token': query.token })
                .then(json => {
                    this._userToken = json.session.key;
                    this._userName = json.session.name;
                    window.localStorage.setItem('lastfm', JSON.stringify({
                        userToken: this._userToken,
                        userName: this._userName
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

    startAuthentication() {
        const currentUrl = window.location.toString();
        window.location.assign(`http://www.last.fm/api/auth/?api_key=${keys.LAST_FM_KEY}&cb=${encodeURIComponent(currentUrl)}`);
    }

    updateNowPlaying(metadata) {
        if(metadata.title && metadata.artist) {
            return this._makeRequest('post', {
                track: metadata.title,
                artist: metadata.artist,
                duration: Math.trunc(metadata.duration),
                method: 'track.updateNowPlaying'
            });
        }
    }

    scrobble(metadata) {
        if(metadata.title && metadata.artist) {
            return this._makeRequest('post', {
                track: metadata.title,
                artist: metadata.artist,
                duration: Math.trunc(metadata.duration),
                timestamp: Math.trunc((+metadata.timestamp) / 1000),
                method: 'track.scrobble'
            });
        }
    }

    _makeRequest(method, params, requiresSignature = true) {
        let mParams = new Map(params instanceof Map ? params : Object.entries(params));
        mParams.set('api_key', keys.LAST_FM_KEY);
        if(this._userToken) {
            mParams.set('sk', this._userToken);
        }
        mParams.set('api_sig', this._signature(mParams));
        mParams.set('format', 'json');

        const query = mParams.map((value, key) => `${key}=${encodeURIComponent(value)}`).join('&');
        method = method.toLowerCase();
        if(method === 'get') {
            return fetch(`${Lastfm.baseUrl}?${query}`).then(response => response.json());
        } else if(method === 'post') {
            const headers = new Headers();
            headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
            return fetch(Lastfm.baseUrl, { method: 'POST', body: query, headers })
                .then(response => response.json());
        } else {
            throw new Error('Unsupported method: ' + method);
        }
    }

    _signature(params) {
        const sig = params
            .sort((a, b) => a.key.localeCompare(b.key))
            .map((value, key) => key + value)
            .reduce((prev, value) => prev + value, '')
            + keys.LAST_FM_SECRET;
        return md5(sig);
    }
}