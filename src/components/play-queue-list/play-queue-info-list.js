import React from 'react';
import { useTransition } from 'react-spring';
import PlayQueueItem from './play-queue-item';
import { usePlayQueue } from '../../hooks/play-queue';

const PlayQueueInfoList = () => {
    const playQueue = usePlayQueue();
    const transitions = useTransition(playQueue.values, ({ objId }) => objId, {
        initial: { transform: 'translateX(0px)', opacity: 1 },
        from: { transform: 'translateX(25px)', opacity: 0 },
        enter: { transform: 'translateX(0px)', opacity: 1 },
        leave: { transform: 'scale(0.9)', opacity: 0 },
        unique: true,
    });

    return (
        <div className="list-container">
            {transitions.map(({ item: song, key, props }, i) => (
                <PlayQueueItem
                    key={key}
                    index={i}
                    song={song}
                    onRemove={playQueue.delete}
                    style={props}
                />
            ))}
            <hr/>
        </div>
    );
};

export default PlayQueueInfoList;
