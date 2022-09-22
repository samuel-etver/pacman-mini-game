let instance;

class GlobalStorage {
}

export default {
    getInstance () {
        if (!instance) {
            instance = new GlobalStorage();
        }
        return instance;
    }
};
