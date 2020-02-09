import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import nanoid from 'nanoid';

const Context = createContext();

export const usePlayQueue = () => useContext(Context);

export const usePlayQueueRef = () => {
    const playQueue = usePlayQueue();
    const ref = useRef(playQueue);

    useEffect(() => {
        ref.current = playQueue;
    }, [playQueue]);

    return ref;
};

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
            const newElements = elements.map(songMap);
            setQueue([...queue, ...newElements]);
            return newElements;
        },
        addFirst(element) {
            const newElement = songMap(element);
            setQueue([newElement, ...queue]);
            return newElement;
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
        find(song) {
            return queue.find(songFind(song));
        },
        update(indexOrElement, element) {
            const index = typeof indexOrElement === 'number' ?
                indexOrElement :
                queue.findIndex(songFind(indexOrElement));
            element = typeof indexOrElement === 'number' ? element : indexOrElement;
            if(index === -1) {
                return;
            }

            const updatedElement = songMap(element);
            setQueue([...queue.slice(0, index), updatedElement, ...queue.slice(index + 1)]);
            return updatedElement;
        },
        swap(fromIndex, toIndex) {
            if(fromIndex === toIndex) {
                return;
            }

            const newQueue = Array.from(queue);
            const [removed] = newQueue.splice(fromIndex, 1);
            newQueue.splice(toIndex, 0, removed);
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
