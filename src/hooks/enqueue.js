import { useCallback } from 'react';
import { usePlayQueue } from './play-queue';
import { addYoutubePlaylist, loadAudioURL } from '../api';
import { decodeHtmlEntities } from '../utils';
import LoadingToast from '../utils/loading-toast';

export const useEnqueueSong = () => {
    const playQueue = usePlayQueue();
    return useCallback(async (youtubeVideoId, title, autoplay) => {
        const toast = new LoadingToast();
        try {
            if(!title) {
                title = (await loadAudioURL(youtubeVideoId)).title;
            }

            title = decodeHtmlEntities(title);
            playQueue.add({ title, id: youtubeVideoId, autoplay });
            toast.success('Enqueued', `"${title}" was added to the queue`);
        } catch(e) {
            toast.error('Failed enqueuing', `Could not enqueue video due to an error - ${e.message} ${e.descriptiveMessage ?? ''}`);
        }
    }, [playQueue]);
};

export const useEnqueuePlaylist = () => {
    const playQueue = usePlayQueue();
    return useCallback(async (youtubePlaylistId, title, autoplay) => {
        const toast = new LoadingToast();
        try {
            const items = await addYoutubePlaylist(youtubePlaylistId);
            playQueue.add(
                ...items.slice(0).map((s) => ({ ...s, title: decodeHtmlEntities(s.title), autoplay })),
                ...items.slice(1).map((s) => ({ ...s, title: decodeHtmlEntities(s.title), })),
            );
            toast.success('Enqueued', `${title ?? 'The playlist'} was added to the queue`);
        } catch(e) {
            toast.error('Failed enqueuing', `Could not enqueue the playlist ${title ?? ''} due to an error - ${e.message} ${e.descriptiveMessage ?? ''}`);
        }
    }, [playQueue]);
};
