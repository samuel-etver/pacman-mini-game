const GlobalEventSystem = require('global-event-system');
const GlobalAudio = require('global-audio');


let globalEventSystem = GlobalEventSystem.getInstance();
let globalAudio = GlobalAudio.getInstance();


cc.Class({
    extends: cc.Component,

    properties: {
        volume: 1.0
    },


    onLoad () {
        this.setVolume();

        this.onSoundVolumeChanged = this.onSoundVolumeChanged.bind(this);
        globalEventSystem.subscribe('sound-volume-changed', this.onSoundVolumeChanged);

        this.onSoundOnToggled = this.onSoundOnToggled.bind(this);
        globalEventSystem.subscribe('sound-on-toggled', this.onSoundOnToggled);
    },


    onDestroy () {
        globalEventSystem.unsubscribe('sound-volume-changed', this.onSoundVolumeChanged);
        globalEventSystem.unsubscribe('sound-on-toggled', this.onSoundOnToggled);
    },


    onSoundVolumeChanged () {
        this.setVolume();
    },


    onSoundOnToggled () {
        this.setVolume();
    },


    setVolume () {
        cc.audioEngine.setEffectsVolume(
          globalAudio.calculateSoundVolume(this.volume)
        );
    }
});
