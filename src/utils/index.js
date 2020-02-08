/**
 * Converts a time in seconds to `{hour:}minutes:seconds` format.
 * @param {number} currentTime Time in seconds
 * @param {number | null | undefined} duration If specified, the duration of the song in seconds
 * @returns {string} The time formated
 */
export const formatTime = (currentTime, duration = null) => {
    const seconds = Math.round(currentTime) % 60;
    let minutes = Math.floor(Math.round(currentTime) / 60);
    if(!duration || duration < 3600) {
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
        const hours = Math.floor(minutes / 60);
        minutes %= 60;
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
};

/**
 * Converts the the query of an URL into a JS object
 * @param {string} str The query of an URL (the part that starts with ?) but without the initial ?
 * @returns {{ [index: string]: string }} A JS Object that represents the query
 */
export const parseQuery = (str) => Object.fromEntries(
    str.split('&').map(e => e.split('=')),
);

/**
 * Tests whether the URL is a YouTube playlist and extract the playlist ID from it.
 * @param {string} url URL to test
 * @returns {{ [index: string]: string } | null} the YouTube playlist ID if the URL is valid, or null otherwise
 */
export const getPlaylistID = (url) => {
    let youtubePlaylistID = /playlist\?(.+)/g.exec(url);
    if(youtubePlaylistID !== null) {
        return parseQuery(youtubePlaylistID[1]).list;
    }
    return null;
};

/**
 * Tests whether the URL is a YouTube video and extract the video ID from it.
 * @param {string} url URL to test
 * @returns {string | null} the YouTube video ID if the URL is valid, or null otherwise
 */
export const getYoutubeVideoID = (url) => {
    let youtubeVideoID =
        /(?:(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\/?\?(.+))|(?:(?:https?:\/\/)?(?:www\.)?youtu\.be\/(.+))/
            .exec(url);
    if (youtubeVideoID !== null) {
        if(youtubeVideoID[2]) {
            return youtubeVideoID[2];
        } else if(youtubeVideoID[1]) {
            let query = parseQuery(youtubeVideoID[1]);
            return query.v;
        }
    }
    return null;
};

const textarea = document.createElement('textarea');
/**
 * Decodes a string with HTML entities.
 * @param {string} unencoded Unencoded string with HTML entities
 * @returns {string} The string without HTML entities.
 */
export const decodeHtmlEntities = (unencoded) => {
    textarea.innerHTML = unencoded ?? '';
    return textarea.innerText;
};
