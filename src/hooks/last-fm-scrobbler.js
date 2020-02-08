import { useEffect, useState } from 'react';
import { Lastfm, parseTitle } from '../LastFM';
import { useAudioPlayer } from './audio-player';

const lastfm = new Lastfm();
window.xD = v => lastfm.disableScrobblings = !!v;
const useLastFmScrobbler = () => {
    const audioPlayer = useAudioPlayer();
    const [scrobbleState, setScrobbleState] = useState(null);

    useEffect(() => {
        //We must end the nowPlaying, if the title is available
        if(!lastfm.hasLoggedIn) {
            return;
        }

        if(scrobbleState === null) {
            const parsed = parseTitle(audioPlayer.loadedSong.title);
            setScrobbleState('now-playing');
            if(parsed) {
                lastfm.updateNowPlaying({
                    ...parsed,
                    duration: audioPlayer.duration,
                    timestamp: new Date(),
                });
            }
        } else if(scrobbleState === 'now-playing' && audioPlayer.currentTime >= Math.min(audioPlayer.duration / 2, 240)) {
            //At the half of the song or when it reaches 4min, the scrobble must be sent, but only if
            //we can get the song's title
            const parsed = parseTitle(audioPlayer.loadedSong.title);
            setScrobbleState('scrobbled');
            if(parsed) {
                lastfm.scrobble({
                    ...parsed,
                    duration: audioPlayer.duration,
                    timestamp: new Date(),
                });
            }
        }
    }, [audioPlayer.currentTime, audioPlayer.duration, audioPlayer.loadedSong, audioPlayer.state, scrobbleState]);

    return lastfm;
};

export default useLastFmScrobbler;
