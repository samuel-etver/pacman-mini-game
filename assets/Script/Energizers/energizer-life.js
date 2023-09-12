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

        this.onGamePause = this.onGamePause.bind(this);
        globalEventSystem.subscribe('game-pause', this.onGamePause);

        this.onGameResume = this.onGameResume.bind(this);
        globalEventSystem.subscribe('game-resume', this.onGameResume);

        this.animation = this.getComponent(sp.Skeleton);
        this.collider  = this.getComponent(cc.Collider);
        this.deactivateEnergizer();
    },


    onDestroy () {
        globalEventSystem.unsubscribe('player-started', this.onPlayerStarted);
        globalEventSystem.unsubscribe('player-stopped', this.onPlayerStopped);
        globalEventSystem.unsubscribe('game-pause', this.onGamePause);
        globalEventSystem.unsubscribe('game-resume', this.onGameResume);

        this.unscheduleAllCallbacks();

        Energizer.prototype.onDestroy?.call(this);
    },


    getInfluence () {
        return ['life-energizer'];
    },


    onPlayerStarted () {
        this.resumeBlink();
        this.hideTemporarily(1);
    },


    onPlayerStopped () {
        this.pauseBlink();
    },


    onGamePause () {
        this.pauseBlink();
    },


    onGameResume () {
        this.resumeBlink();
    },


    resumeBlink () {
        let scheduler = cc.director.getScheduler()
        scheduler.resumeTarget(this);
        this.animation.paused = false;
    },


    pauseBlink () { 
        let scheduler = cc.director.getScheduler()
        scheduler.pauseTarget(this);
        this.animation.paused = true;
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
