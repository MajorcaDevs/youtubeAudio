import $ from 'jquery';
import { GOOGLE_API_KEY } from './keys';
const BASE_API_URL = "https://ytdl-audio-api.melchor9000.me/api";

const compatibility = (function() {
    let a = document.createElement("audio");
    return {
        opus: ((a.canPlayType("audio/webm; codecs=opus")) !== ""),
        vorbis: ((a.canPlayType("audio/webm; codecs=vorbis")) !== ""),
        m4a: ((a.canPlayType("audio/x-m4a; codecs=mp4a.40.2")) !== "")
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
    }
}

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
export const selectBestOption = (youtubeVideoID) => new Promise((resolve, reject) => {
    $.ajax({
        async: true,
        type: "GET",
        url: `${BASE_API_URL}/${youtubeVideoID}/formats`,
        success: (response) => {
            response = response
                .filter(e => compatibility.m4a && e.container === 'm4a')
                .concat(response.filter(e => compatibility.vorbis && e.extra.startsWith('vorbis')))
                .concat(response.filter(e => compatibility.opus && e.extra.startsWith('opus')));
            if(response.length === 0) {
                reject(new ApiException('No compatible sources for your browser',
                       'We could not find any compatible sources for your browser. It seems ' +
                       'that your browser doesn\'t support neither Opus, Vorbis nor AAC.'));
                return;
            }
            response.forEach(e => {
                let bits = e.extra.split(/[\s@k]+/g);
                e.codec = bits[0]; e.bitrate = parseInt(bits[1], 10);
                if (e.codec !== "vorbis" && e.codec !== "opus")
                    e.codec = "m4a";
            });
            response.sort(predicateBy("bps", true));
            resolve(response[0]);
        },
        error: () => reject(new ApiException('Video not found', 'Check that the video URL exists or is complete.'))
    });
});

/**
 * Loads the audio URL (and title) of the video with the selected quality. If quality is `null` then will
 * use the best available quality for the audio. async/await compatible.
 * @param {string} youtubeVideoID Youtube video ID (that part of an yt url that follows after the ?v=)
 * @param {number | null} formatID A format ID returned from selectBestOption or nothing
 * @returns A Promise
 */
export const loadAudioURL = (youtubeVideoID, formatID = null) => new Promise((resolve, reject) => {
    $.ajax({
        async: true,
        type: "GET",
        url: formatID ? `${BASE_API_URL}/${youtubeVideoID}/${formatID}` : `${BASE_API_URL}/${youtubeVideoID}`,
        success: (response) => {
            resolve(response);
        },
        error: () => reject(new ApiException('Video not found', 'Check that the video URL exists or is complete.'))
    });
});

/**
 * Loads a full playlist into a list of `{ id: ..., title: ... }` objects. async/await compatible.
 * @param {string} youtubePlaylistID The youtube playlist ID (that part that follows next ?list=)
 * @param {string | null} nextId Used internally, don't set any value
 * @returns A Promise
 */
export const addYoutubePlaylist = (youtubePlaylistID, nextId = null) => new Promise((resolve, reject) => {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=id,snippet&maxResults=50&playlistId=${youtubePlaylistID}&key=${GOOGLE_API_KEY}`;
    if(nextId) url += `&pageToken=${nextId}`;
    $.ajax({
        url,
        async: true,
        type: 'GET',
        success: response => {
            const items = response.items.map(item => ({ id: item.snippet.resourceId.videoId, title: item.snippet.title }));
            if(response.nextPageToken) {
                addYoutubePlaylist(youtubePlaylistID, response.nextPageToken)
                    .then(moreItems => resolve([ ...items, ...moreItems ]))
                    .catch(reject);
            } else {
                resolve(items);
            }
        },
        error: () => reject(new ApiException('Cannot load videos from playlist',
                                             'Something bad has happened while we were asking to YouTube for the videos in that playlist :('))
    });
});

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
            this.url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&maxResults=${Math.min(maxResults, 50)}`;
            this.nextPageToken = null;
            this.totalListed = 0;
            this.total = NaN;
        }

        getNextPage() {
            if(this.hasEnded) {
                return Promise.reject(new Error("End of the list"));
            }

            return new Promise((resolve, reject) => {
                let url = this.url;
                if(this.nextPageToken) {
                    url += `&pageToken=${this.nextPageToken}`;
                }

                $.ajax({
                    url,
                    async: true,
                    type: 'GET',
                    success: response => {
                        if(response.nextPageToken) {
                            this.nextPageToken = response.nextPageToken;
                        }
                        this.totalListed += response.items.length;
                        this.total = response.pageInfo.totalResults;
                        resolve(response.items);
                    },
                    error: () => reject(new ApiException('Cannot search for videos',
                                                         'Something bad has happened while we were asking to YouTube for videos :('))
                })
            });
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
