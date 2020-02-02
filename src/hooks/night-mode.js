import React, { createContext, useContext, useState, useEffect } from 'react';

const Context = createContext();

/**
 * Gets the current value of the night mode as React Hook
 * @returns {boolean} Night mode value
 */
export const useNightMode = () => useContext(Context).nightMode;

/**
 * Gets the night mode setter as React Hook
 * @returns {(nightMode: boolean) => void} Setter for night mode
 */
export const useNightModeSetter = () => useContext(Context).setNightMode;

export const NightModeProvider = ({ children }) => {
    const [nightMode, setNightMode] = useState(
        (localStorage.getItem('youtube-audio:nightMode') ?? 'true') === 'true'
    );

    useEffect(() => {
        localStorage.setItem('youtube-audio:nightMode', nightMode.toString());
        if(nightMode) {
            document.body.classList.add('AppDark');
            document.body.classList.remove('AppLight');
        } else {
            document.body.classList.remove('AppDark');
            document.body.classList.add('AppLight');
        }
    }, [nightMode]);

    return <Context.Provider value={{ nightMode, setNightMode }}>{children}</Context.Provider>;
};
