let instance;

class GlobalEventSystem {
    subscribers = {};


    subscribe (event, listener) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push( listener );
    }


    publish (event, ...args) {
        let allListeners = this.subscribers[event];
        allListeners && (allListeners.forEach(listener => listener(event, ...args)));
    }


    unsubscribe (event, listener) {
        let listeners = this.subscribers[event];
        if (listeners) {
            this.subscribers[event] = listeners.filter(x => x !== listener);
        }
    }
};

module.exports = {
    getInstance () {
        if (!instance) {
            instance = new GlobalEventSystem();
        }
        return instance;
    }
};
