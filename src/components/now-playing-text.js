import React from 'react';
import { usePlayQueue } from '../hooks/play-queue';

const NowPlayingText = () => {
    const playQueue = usePlayQueue();
    const song = playQueue.values[0];

    if(!song || !song.title) {
        return null;
    }

    const currentFormat = `(${song.codec}@~${song.bitrate}kbps)`;
    return (
        <div className="now-playing-text" id="stateText">
            <div id="quality-format">{song.codec ? currentFormat : ''}</div>
            <div id="NowPlaying">Now Playing:</div>
            <div id="title" className="text-center">{song.title}</div>
        </div>
    );
};

export default NowPlayingText;
