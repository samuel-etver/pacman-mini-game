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

        this.onMusicVolumeChanged = this.onMusicVolumeChanged.bind(this);
        globalEventSystem.subscribe('music-volume-changed', this.onMusicVolumeChanged);

        this.onMusicOnToggled = this.onMusicOnToggled.bind(this);
        globalEventSystem.subscribe('music-on-toggled', this.onMusicOnToggled);
    },


    onDestroy () {
        globalEventSystem.unsubscribe('music-volume-changed', this.onMusicVolumeChanged);
        globalEventSystem.unsubscribe('music-on-toggled', this.onMusicOnToggled);
    },


    onMusicVolumeChanged () {
        this.setVolume();
    },


    onMusicOnToggled () {
        this.setVolume();
    },


    setVolume () {
        cc.audioEngine.setMusicVolume(
          globalAudio.calculateMusicVolume(this.volume)
        );
    }
});
