import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import nanoid from 'nanoid';

const Context = createContext();

export const usePlayQueue = () => useContext(Context);

const songMap = (song) => {
    if(!song.objId) {
        song.objId = nanoid();
    }
    return song;
};

const songFind = (element) => ({ id, objId }) => (
    (!(objId && element.objId) || objId === element.objId)
        && id === element.id
);

export const PlayQueueProvider = ({ children }) => {
    const [queue, setQueue] = useState(
        JSON.parse(sessionStorage.getItem('youtube-audio:playQueue') || '[]')
    );

    const methods = useMemo(() => ({
        add(...elements) {
            setQueue([...queue, ...elements.map(songMap)]);
        },
        addFirst(element) {
            setQueue([songMap(element), ...queue]);
        },
        empty() {
            setQueue([]);
        },
        deleteFirst() {
            if(queue.length > 0) {
                setQueue(queue.slice(1));
                return queue[0];
            }

            return null;
        },
        delete(element) {
            const index = queue.findIndex(songFind(element));
            if(index !== -1) {
                setQueue([
                    ...queue.slice(0, index),
                    ...queue.slice(index + 1),
                ]);
            }
        },
        update(indexOrElement, element) {
            const index = typeof indexOrElement === 'number' ?
                indexOrElement :
                queue.findIndex(songFind(element));
            if(index === -1) {
                return;
            }

            const updatedElement = songMap(element);
            setQueue([...queue.slice(0, index), updatedElement, ...queue.slice(index + 1)]);
            return updatedElement;
        },
        swap(fromIndex, toIndex) {
            const newQueue = [...queue];
            const [removed] = newQueue.splice(fromIndex + 1, 1);
            newQueue.splice(toIndex + 1, 0, removed);
            setQueue(newQueue);
        },
        get length() {
            return queue.length;
        },
        get values() {
            return queue;
        },
    }), [queue]);

    useEffect(() => {
        const json = JSON.stringify(queue.map((s) => ({ ...s, autoplay: undefined })));
        sessionStorage.setItem('youtube-audio:playQueue', json);
    }, [queue]);

    return <Context.Provider value={methods}>{children}</Context.Provider>;
};
