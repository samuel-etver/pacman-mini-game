const GlobalStorage = require('global-storage');
const GlobalEventSystem = require('global-event-system');

let globalStorage = GlobalStorage.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();

cc.Class({
    extends: cc.Component,


    onLoad () {
        this.onSpeedLevelChanged = this.onSpeedLevelChanged.bind(this);
    },


    onEnable () {
        this.setTimeScale();        
        globalEventSystem.subscribe('speed-level-changed', this.onSpeedLevelChanged);
    },


    onDisable () {
        this.resetTimeScale();
        globalEventSystem.unsubscribe('speed-level-changed', this.onSpeedLevelChanged);
    },


    setTimeScale () {
        const scaleMin = 0.7;
        const scaleMax = 1.2;

        const timeScale = scaleMin + (scaleMax - scaleMin) * globalStorage.scene.speedLevel;

        cc.director.getScheduler().setTimeScale(timeScale);
    },


    resetTimeScale () {
        cc.director.getScheduler().setTimeScale(1);
    },


    onSpeedLevelChanged () {
        this.setTimeScale();
    }
});
