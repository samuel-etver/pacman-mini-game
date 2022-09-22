const GlobalEventSystem = require('global-event-system');
const Score = require('score');

let globalEventSystem = GlobalEventSystem.getInstance();
let score = Score.getInstance();

cc.Class({
    extends: cc.Component,

    onLoad () {
        this.label = this.getComponent(cc.Label);
        this.onScorePointsChanged = this.onScorePointsChanged.bind(this);  
    },


    onEnable () {
        globalEventSystem.subscribe('score-points-changed', this.onScorePointsChanged);
    },


    onDisable () {
        globalEventSystem.unsubscribe('score-points-changed', this.onScorePointsChanged);
    },


    onScorePointsChanged () {
        this.label.string = score.points.toString();
    },
});
