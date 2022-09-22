const GlobalEventSystem = require('global-event-system');
const Energizer = require('energizer');

let globalEventSystem = GlobalEventSystem.getInstance();

cc.Class({
    extends: Energizer,
    
    getInfluence : function () {
        return [
            'harmless-enemies-energizer'
        ];
    }
});

