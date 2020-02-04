import { useCallback } from 'react';
import { usePlayQueue } from './play-queue';
import { addYoutubePlaylist, loadAudioURL } from '../api';
import LoadingToast from '../utils/loading-toast';

export const useEnqueueSong = () => {
    const playQueue = usePlayQueue();
    return useCallback(async (youtubeVideoId, title) => {
        const toast = new LoadingToast();
        try {
            if(!title) {
                title = (await loadAudioURL(this.state.youtubeVideoID)).title;
            }

            playQueue.add({ title, id: youtubeVideoId });
            toast.success('Enqueued', `"${title}" was added to the queue`);
        } catch(e) {
            toast.error('Failed enqueuing', `Could not enqueue video due to an error - ${e.message} ${e.descriptiveMessage}`);
        }
    }, [playQueue]);
};

export const useEnqueuePlaylist = () => {
    const playQueue = usePlayQueue();
    return useCallback(async (youtubePlaylistId, title) => {
        const toast = new LoadingToast();
        try {
            const items = await addYoutubePlaylist(youtubePlaylistId);
            playQueue.add(...items);
            toast.success('Enqueued', `${title ?? 'The playlist'} was added to the queue`);
        } catch(e) {
            toast.error('Failed enqueuing', `Could not enqueue the playlist ${title ?? ''} due to an error - ${e.message} ${e.descriptiveMessage}`);
        }
    }, [playQueue]);
};
