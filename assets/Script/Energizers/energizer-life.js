const GlobalEventSystem = require('global-event-system');
const GlobalStorage = require('global-storage');
const Energizer = require('energizer');

let globalEventSystem = GlobalEventSystem.getInstance();
let globalStorage = GlobalStorage.getInstance();

cc.Class({
    extends: Energizer,
    

    onLoad () {
        Energizer.prototype.onLoad?.call(this);

        this.onPlayerStarted = this.onPlayerStarted.bind(this);
        globalEventSystem.subscribe('player-started', this.onPlayerStarted);

        this.onPlayerStopped = this.onPlayerStopped.bind(this);
        globalEventSystem.subscribe('player-stopped', this.onPlayerStopped);

        this.animation = this.getComponent(dragonBones.ArmatureDisplay);
        this.collider  = this.getComponent(cc.Collider);
        this.deactivateEnergizer();
    },


    onDestroy () {
        globalEventSystem.unsubscribe('player-started', this.onPlayerStarted);
        globalEventSystem.unsubscribe('player-stopped', this.onPlayerStopped);

        this.unscheduleAllCallbacks();

        Energizer.prototype.onDestroy?.call(this);
    },


    getInfluence: function () {
        return ['life-energizer'];
    },


    onPlayerStarted: function () {
        this.startBlink();
    },


    onPlayerStopped: function () {
        this.stopBlink();
    },


    startBlink () {
        let scheduler = cc.director.getScheduler()
        scheduler.resumeTarget(this);
        this.hideTemporarily(1);
    },


    showTemporarily () {
        let roadNetworkGraph = globalStorage.scene.roadNetworkGraph;
        let newPosition = roadNetworkGraph.getRandomPosition();

        this.node.x = newPosition.x;
        this.node.y = newPosition.y;

        this.activateEnergizer();
        this.scheduleOnce(this.hideTemporarily, 2);
    },


    hideTemporarily (value) {
        this.deactivateEnergizer();
        this.scheduleOnce(this.showTemporarily, value ?? 2);
    },


    stopBlink () { 
        let scheduler = cc.director.getScheduler()
        scheduler.pauseTarget(this);
    },


    collect () {
        this.deactivateEnergizer();
    },


    activateEnergizer (value) {
        value = value ?? true;
        this.animation.enabled = value;
        this.collider.enabled = value;
    },


    deactivateEnergizer () {
        this.activateEnergizer(false);        
    }
});
