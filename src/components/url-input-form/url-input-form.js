import React, { useCallback, useState } from 'react';
import YtUrlInput from './yt-url-input';
import Button from '../button';
import { useEnqueuePlaylist, useEnqueueSong } from '../../hooks/enqueue';
import { usePlayQueue } from '../../hooks/play-queue';

const UrlInputForm = () => {
    const [ytUrlInputState, setYtUrlInputState] = useState(null);
    const playQueue = usePlayQueue();
    const enqueuePlaylist = useEnqueuePlaylist();
    const enqueueSong = useEnqueueSong();
    const [loading, setLoading] = useState(false);

    const playSong = useCallback((e) => {
        e.preventDefault();
        if(ytUrlInputState.videoId) {
            playQueue.addFirst({ id: ytUrlInputState.videoId, autoplay: true });
        } else if(ytUrlInputState.playlistId) {
            setLoading(true);
            enqueuePlaylist(ytUrlInputState.playlistId).finally(() => setLoading(false));
        }
    }, [playQueue, setLoading, enqueuePlaylist, ytUrlInputState]);

    const addToQueue = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        if(ytUrlInputState.playlistId) {
            await enqueuePlaylist(ytUrlInputState.playlistId);
        } else {
            await enqueueSong(ytUrlInputState.videoId);
        }
        setLoading(false);
    }, [setLoading, enqueuePlaylist, enqueueSong, ytUrlInputState]);

    const nextSong = useCallback((e) => {
        e.preventDefault();
        playQueue.deleteFirst();
    }, [playQueue]);

    const { isUrlInvalid } = ytUrlInputState ?? {};
    return (
        <>
            <YtUrlInput loading={loading} onStateChanged={setYtUrlInputState} />
            <div className="row justify-content-center">
                <div className="btn-group mt-3">
                    <Button
                        name="Play Song"
                        value="Play Now!"
                        onClick={playSong}
                        disabled={loading || isUrlInvalid}
                    />
                    <Button
                        name="Add to Queue"
                        value="Enqueue"
                        onClick={addToQueue}
                        disabled={loading || isUrlInvalid}
                    />
                    <Button
                        name="Next song"
                        value="Next Song"
                        onClick={nextSong}
                        disabled={loading || playQueue.length < 2}
                    />
                </div>
            </div>
        </>
    );
};

export default UrlInputForm;
