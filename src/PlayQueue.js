
export default class PlayQueue {
    constructor(initialValue) {
        if(initialValue) {
            this._array = initialValue;
            window.sessionStorage.setItem("playQueue", JSON.stringify(this._array));
        } else {
            let playQueueJSONString = window.sessionStorage.getItem('playQueue');
            if (playQueueJSONString !== null){
                this._array= JSON.parse(playQueueJSONString);
            } else {
                window.sessionStorage.setItem("playQueue", "[ ]");
            }
        }
    }

    get values() { return this._array; }

    add(element) {
       return new PlayQueue([...this.values, element ]);
    }

    addFirst(element) {
        return new PlayQueue([ element, ...this.values ]);
    }

    emptyQueue(){
        return new PlayQueue([]);
    }

    deleteFirst(){
        return new PlayQueue(this.values.slice(1));
    }

    delete(element){
        let index = this.values.findIndex(searchElement => element.id === searchElement.id);
        if (index !== -1) {
            return new PlayQueue(this.values.slice(0, index).concat(this.values.slice(index + 1)));
        } else {
            return this;
        }
    }

}