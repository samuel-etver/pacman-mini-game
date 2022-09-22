const GlobalEventSystem = require('global-event-system');
const GlobalAudio = require('global-audio');


let globalEventSystem = GlobalEventSystem.getInstance();
let globalAudio = GlobalAudio.getInstance();


cc.Class({
    extends: cc.Component,


    onLoad () {
        this.audioSource = this.getComponent(cc.AudioSource);
        this.basicVolume = this.audioSource.volume;
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
        this.audioSource.volume = globalAudio.calculateMusicVolume(this.basicVolume);
    }
});
