
cc.Class({
    extends: cc.Component,

    properties: {
        clip: {
            default: null,
            type: cc.AudioClip
        }
    },

    
    onEnable () {
        if (this.clip) {
          cc.audioEngine.playMusic(this.clip, true);
        }
    },


    onDisable () {
        cc.audioEngine.stopMusic();
    }
});
