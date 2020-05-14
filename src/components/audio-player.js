import bowser from 'bowser';
import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { selectBestOption, loadAudioURL, getPassthroughUrl } from '../api';
import { usePlayQueue, usePlayQueueRef } from '../hooks/play-queue';
import LoadingToast from '../utils/loading-toast';

export const AudioPlayerContext = createContext();

export const PlayerState = Object.seal({
    STOPPED: 'stopped',
    PLAYING: 'playing',
    PAUSED: 'paused',
});

const browser = bowser.getParser(window.navigator.userAgent);

const AudioPlayer = () => {
    const playQueue = usePlayQueue();
    const playQueueRef = usePlayQueueRef();
    const { setValue: setAudioPlayerContextValue } = useContext(AudioPlayerContext) ?? {};
    const audioRef = useRef();
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState(PlayerState.STOPPED);
    const [loadedSong, setLoadedSong] = useState(null);

    const loadSongInQueue = useCallback(async (autoplay) => {
        let song = playQueue.values[0];
        const toast = new LoadingToast(song.title ?? 'song');
        setLoading(true);
        setAudioUrl(null);
        try {
            let { codec, bitrate, qualityId } = song;
            if(!qualityId) {
                const res = await selectBestOption(song.id);
                codec = res.codec;
                bitrate = res.bitrate || res.bps;
                qualityId = res.id;
                song = playQueueRef.current.update(0, { ...song, codec, bitrate: bitrate, qualityId });
            }

            const { urls, title } = await loadAudioURL(song.id, qualityId);
            setLoadedSong(song = playQueueRef.current.update(0, { ...song, title }));
            setAudioUrl(urls[`${qualityId}`]);

            if(song.autoplay ?? autoplay) {
                audioRef.current.oncanplay = async () => {
                    try {
                        await audioRef.current.play();
                        toast.dismiss();
                    } catch (e) {
                        toast.info('Manual play is required', 'Due to your browser configuration, we cannot press play for you. You can change your autoplay options in the browser\'s configuration.');
                    }

                    audioRef.current.oncanplay = null;
                };
            } else {
                toast.dismiss();
            }
        } catch (e) {
            toast.error(e.message, e.descriptiveMessage);
        }
        setLoading(false);
    }, [playQueue, playQueueRef]);

    const onPlayerError = useCallback((e) => {
        const { error } = e.target;
        switch(error.code) {
            case error.MEDIA_ERR_NETWORK:
                new LoadingToast().error('There was a network error', 'Check your internet connection.');
                break;

            case error.MEDIA_ERR_SRC_NOT_SUPPORTED: {
                const { id, qualityId } = playQueue.values[0];
                setAudioUrl(getPassthroughUrl(id, qualityId));
                break;
            }

            default:
                console.error(`Unhandled player error ${error.code}`);
        }
    }, [playQueue]);

    const onPlayerSongEnd = useCallback(() => {
        playQueue.deleteFirst();

        setAudioPlayerContextValue((value) => ({
            ...value,
            currentTime: null,
            duration: null,
        }));
    }, [playQueue, setAudioPlayerContextValue]);

    const onPlayerPlayProgressUpdate = useCallback(() => {
        let { currentTime, duration } = audioRef.current;
        if(browser.satisfies({ safari: '>1' })) {
            //Workaround for Safari m4a playing bug
            duration /= 2;
        }

        setAudioPlayerContextValue((value) => ({
            ...value,
            currentTime,
            duration,
        }));

        if(currentTime > duration && currentTime - duration > 1) {
            //Workaround for Safari on m4a playing
            audioRef.current.pause();
            onPlayerSongEnd();
        }
    }, [onPlayerSongEnd, setAudioPlayerContextValue]);

    const onPlayerPlay = useCallback(() => {
        setState(PlayerState.PLAYING);
    }, []);

    const onPlayerPause = useCallback(() => {
        setState(PlayerState.PAUSED);
    }, []);

    useEffect(() => {
        const onTopSong = playQueue.values[0];
        if(onTopSong && onTopSong.objId !== loadedSong?.objId) {
            if(!loading) {
                loadSongInQueue(state !== PlayerState.STOPPED);
            }
        } else if(!onTopSong) {
            setLoadedSong(null);
            setAudioUrl(null);
            setState(PlayerState.STOPPED);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playQueue, loadSongInQueue, state]);

    useEffect(() => {
        setAudioPlayerContextValue((value) => ({
            ...value,
            loading,
            state,
            loadedSong,
            ref: audioRef,
        }));
    }, [loading, state, loadedSong, setAudioPlayerContextValue]);

    if(!audioUrl) {
        return null;
    }

    return (
        <audio
            ref={audioRef}
            id="player"
            className="player"
            controls
            src={audioUrl}
            onError={onPlayerError}
            onTimeUpdate={onPlayerPlayProgressUpdate}
            onEnded={onPlayerSongEnd}
            onPlay={onPlayerPlay}
            onPause={onPlayerPause}
        />
    );
};

AudioPlayer.State = PlayerState;

export default AudioPlayer;
