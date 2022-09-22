const GlobalStorage = require('global-storage');
const GlobalEventSystem = require('global-event-system');

let globalStorage = GlobalStorage.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();

class Score {
    get gemsCount () {
        return globalStorage.scene.gemsCount;
    }    


    set gemsCount (value) {
        globalStorage.scene.gemsCount = value;
        globalEventSystem.publish('gems-count-changed');
    }   


    get playerLivesCount () {
        return globalStorage.scene.playerLivesCount;
    }


    set playerLivesCount (value) {
        globalStorage.scene.playerLivesCount = value;
        globalEventSystem.publish('player-lives-count-changed');        
    }


    get killedCount () {
        return globalStorage.scene.killedCount;
    }


    set killedCount (value) {
        globalStorage.scene.killedCount = value;
        globalEventSystem.publish('killed-count-changed');
    }


    get points() {
        return globalStorage.scene.scorePoints;
    }


    set points (value) {
        globalStorage.scene.scorePoints = value;
        globalEventSystem.publish('score-points-changed');
    }
};

export default {
    getInstance () {
        if (!globalStorage.score) {
            globalStorage.score = new Score();
        }
        return globalStorage.score;
    },
};
