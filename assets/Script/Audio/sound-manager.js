const GlobalEventSystem = require('global-event-system');
const GlobalAudio = require('global-audio');


let globalEventSystem = GlobalEventSystem.getInstance();
let globalAudio = GlobalAudio.getInstance();


cc.Class({
    extends: cc.Component,

    properties: {
        ButtonClickClip: {
            default: null,
            type: cc.AudioClip
        }
    },


    onLoad () {
        let ids = globalAudio.SoundClipIds;
        this.clipsLib = {
            [ids.BUTTON_CLICK]: this.ButtonClickClip
        };

        this.onPlay = this.onPlay.bind(this);
    },


    onEnable () {
        globalEventSystem.subscribe('play-sound', this.onPlay);
    },


    onDisable () {
        globalEventSystem.unsubscribe('play-sound', this.onPlay);        
        this.stopAll();
    },


    onPlay (event, clipId) {
        this.play(clipId);
    },


    play (id) {
        let clip = this.clipsLib[id];
        clip && cc.audioEngine.playEffect(clip, false);
    },


    stopAll () {
        cc.audioEngine.stopAll();
    },
});
