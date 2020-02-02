import React from 'react';

const NowPlayingText = ({ title, currentFormat }) => title && (
    <div className="title" id="stateText">
        <div id="NowPlaying">
            Now Playing: ({ currentFormat })
        </div>
        <div id="title" className="text-center"> { title } </div>
    </div>
);

export default NowPlayingText;
