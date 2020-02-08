import React, { useState, useContext } from 'react';
import { AudioPlayerContext } from '../components/audio-player';

export const useAudioPlayer = () => useContext(AudioPlayerContext).value ?? {};

export const AudioPlayerProvider = ({ children }) => {
    const [value, setValue] = useState(null);

    return (
        <AudioPlayerContext.Provider value={{ value, setValue }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
