import { GOOGLE_API_KEY } from './keys';
const BASE_API_URL = 'https://youtubeaudio.majorcadevs.com/api';

const compatibility = (function() {
    let a = document.createElement('audio');
    return {
        opus: ((a.canPlayType('audio/webm; codecs=opus')) !== ''),
        vorbis: ((a.canPlayType('audio/webm; codecs=vorbis')) !== ''),
        m4a: ((a.canPlayType('audio/x-m4a; codecs=mp4a.40.2')) !== '')
    };
})();

const predicateBy = (prop, desc) => {
    return (a,b) => {
        if (a[prop] > b[prop])
            return desc ? -1 : 1;
        else if(a[prop] < b[prop])
            return desc ? 1 : -1;
        else
            return 0;
    };
};

class ApiException {
    constructor(a, b) {
        this.message = a;
        this.descriptiveMessage = b;
    }
}

/**
 * Selects the best available and compatible quality for the video + browser and returns the result. async/await
 * compatible.
 * @param {string} youtubeVideoID Youtube video ID (that part at the end of an URL that follows after the ?v=)
 * @returns a Promise
 */
export const selectBestOption = async (youtubeVideoID) => {
    const res = await fetch(`${BASE_API_URL}/${youtubeVideoID}/formats`);
    if(!res.ok) {
        throw new ApiException('Video not found', 'Check that the video URL exists or is complete.');
    }

    const { audio: formats } = await res.json();
    const supportedFormats = formats
        .filter(e => compatibility.m4a && e.container === 'm4a')
        .concat(formats.filter(e => compatibility.vorbis && e.codec.startsWith('vorbis')))
        .concat(formats.filter(e => compatibility.opus && e.codec.startsWith('opus')));
    if(supportedFormats.length === 0) {
        throw new ApiException('No compatible sources for your browser',
            'We could not find any compatible sources for your browser. It seems ' +
                'that your browser doesn\'t support neither Opus, Vorbis nor AAC.');
    }

    supportedFormats.forEach(e => {
        if (e.codec !== 'vorbis' && e.codec !== 'opus')
            e.codec = 'm4a';
    });
    supportedFormats.sort(predicateBy('bps', true));

    return supportedFormats[0];
};

/**
 * Loads the audio URL (and title) of the video with the selected quality. If quality is `null` then will
 * use the best available quality for the audio. async/await compatible.
 * @param {string} youtubeVideoID Youtube video ID (that part of an yt url that follows after the ?v=)
 * @param {number | null} formatID A format ID returned from selectBestOption or nothing
 * @returns A Promise
 */
export const loadAudioURL = async (youtubeVideoID, formatID = null) => {
    const res = await fetch(formatID ? `${BASE_API_URL}/${youtubeVideoID}/${formatID}` : `${BASE_API_URL}/${youtubeVideoID}`);
    if(!res.ok) {
        throw new ApiException('Video not found', 'Check that the video URL exists or is complete.');
    }

    return res.json();
};

/**
 * Loads a full playlist into a list of `{ id: ..., title: ... }` objects. async/await compatible.
 * @param {string} youtubePlaylistID The youtube playlist ID (that part that follows next ?list=)
 * @param {string | null} nextId Used internally, don't set any value
 * @returns A Promise
 */
export const addYoutubePlaylist = async (youtubePlaylistID, nextId = null) => {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=id,snippet&maxResults=50&playlistId=${youtubePlaylistID}&key=${GOOGLE_API_KEY}`;
    if(nextId) url += `&pageToken=${nextId}`;

    const res = await fetch(url);
    if(!res.ok) {
        throw new ApiException(
            'Cannot load videos from playlist',
            'Something bad has happened while we were asking to YouTube for the videos in that playlist :(',
        );
    }

    const response = await res.json();
    const items = response.items.map(item => ({ id: item.snippet.resourceId.videoId, title: item.snippet.title }));
    if(response.nextPageToken) {
        const moreItems = await addYoutubePlaylist(youtubePlaylistID, response.nextPageToken);
        return [...items, ...moreItems];
    } else {
        return items;
    }
};

/**
 * Prepares a Youtube Video Search with the query and returns a class with getNextPage() and hasEnded.
 * getNextPage() returns a promise with more results, and hasEnded returns true if there's no more
 * results to retreive.
 * @param {string} query Query of the search
 * @param {number} maxResults Number of results per page (10 by default)
 */
export const searchVideos = (query, maxResults = 10) => {
    class YoutubeVideoSearch {
        constructor() {
            this.url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&maxResults=${Math.min(maxResults, 50)}&type=video,playlist`;
            this.nextPageToken = null;
            this.totalListed = 0;
            this.total = NaN;
        }

        async getNextPage() {
            if(this.hasEnded) {
                throw new Error('End of the list');
            }

            let url = this.url;
            if(this.nextPageToken) {
                url += `&pageToken=${this.nextPageToken}`;
            }

            const res = await fetch(url);
            if(!res.ok) {
                throw new ApiException(
                    'Cannot search for videos',
                    'Something bad has happened while we were asking to YouTube for videos :(',
                );
            }

            const response = await res.json();
            if(response.nextPageToken) {
                this.nextPageToken = response.nextPageToken;
            }
            this.totalListed += response.items.length;
            this.total = response.pageInfo.totalResults;
            return response.items;
        }

        get hasEnded() {
            return this.totalListed === this.total;
        }

        get loadedPages() {
            return Math.ceil(this.totalListed / maxResults);
        }

        get totalPages() {
            return Math.ceil(this.total / maxResults);
        }
    }

    return new YoutubeVideoSearch();
};

export const getPassthroughUrl = (youtubeVideoID, qualityFromAudio) => `${BASE_API_URL}/${youtubeVideoID}/${qualityFromAudio}/passthrough`;