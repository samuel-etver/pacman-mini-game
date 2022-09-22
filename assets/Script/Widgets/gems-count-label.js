const GlobalEventSystem = require('global-event-system');
const GlobalStorage = require('global-storage');
const Score = require('score');

let globalEventSystem = GlobalEventSystem.getInstance();
let globalStorage = GlobalStorage.getInstance();
let score = Score.getInstance();

cc.Class({
    extends: cc.Component,

    onLoad () {
        this.label = this.getComponent(cc.Label);
        this.onGemsCountChanged = this.onGemsCountChanged.bind(this);  
    },


    onEnable () {
        globalEventSystem.subscribe('gems-count-changed', this.onGemsCountChanged);
    },


    onDisable () {
        globalEventSystem.unsubscribe('gems-count-changed', this.onGemsCountChanged);
    },


    onGemsCountChanged () {
        this.label.string = score.gemsCount + "/" + globalStorage.scene.numberOfGems;
    },
});
