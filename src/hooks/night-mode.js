import React, { createContext, useContext, useState, useEffect } from 'react';

const Context = createContext();

export const useNightMode = () => useContext(Context).nightMode;

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
