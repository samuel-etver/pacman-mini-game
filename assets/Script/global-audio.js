const GlobalConfig = require('global-config');

let globalConfig = GlobalConfig.getInstance();

let instance;


class GlobalAudio {
    SoundClipIds = cc.Enum({
        NONE: 1,
        BUTTON_CLICK: 2
    })

    calculateMusicVolume (basicVolume) {
        return basicVolume * globalConfig.musicVolume * (globalConfig.musicOn ? 1 : 0);
    }

    calculateSoundVolume (basicVolume) {
        return basicVolume * globalConfig.soundVolume * (globalConfig.soundOn ? 1 : 0);
    }
};


export default {
    getInstance () {
        if (!instance) {
            instance = new GlobalAudio();
        }
        return instance;
    }
};
