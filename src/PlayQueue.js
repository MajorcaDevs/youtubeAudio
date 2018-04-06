
export default class PlayQueue {
    constructor(initialValue) {
        if(initialValue) {
            this._array = initialValue;
            this._store();
        } else {
            let playQueueJSONString = this._obtain();
            if (playQueueJSONString !== null){
                this._array = playQueueJSONString;
            } else {
                this._array = [];
                this._store();
            }
        }
    }

    get values() { return this._array; }

    add(...elements) {
       return new PlayQueue([...this.values, ...elements ]);
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

    _store() {
        try {
            window.sessionStorage.setItem("playQueue", JSON.stringify(this._array))
        } catch(e) {}
    }

    _obtain() {
        let value = window.sessionStorage.getItem('playQueue');
        return value ? JSON.parse(value) : value;
    }

}