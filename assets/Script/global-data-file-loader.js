const GlobalConfig = require('global-config');
const GlobalDataFile = require('global-data-file');
const GlobalStorage = require('global-storage');
const Achievements = require('achievements');

let globalConfig = GlobalConfig.getInstance();
let globalDataFile = GlobalDataFile.getInstance();
let globalStorage = GlobalStorage.getInstance();

let instance;

class GlobalDataFileLoader {
    constructor () {
        this.loaded = false;
    }


    load () {
        if (!this.loaded && !globalConfig.skipGlobalDataFileLoader) {
            this.forceLoad();
            this.loaded = true;
        }
    }


    forceLoad () {
        let readBool = (key, defValue) => globalDataFile.readBool(key, defValue);

        let readPercentage = (key, defValue) => {
            let value = globalDataFile.readFloat(key, defValue);
            return (0.0 <= value && value <= 1.0) ? value : defValue;
        };

        globalConfig.musicOn = readBool('MusicOn', globalConfig.musicOn);
        globalConfig.soundOn = readBool('SoundOn', globalConfig.soundOn);
        globalConfig.musicVolume = readPercentage('MusicVolume', globalConfig.musicVolume);
        globalConfig.soundVolume = readPercentage('SoundVolume', globalConfig.soundVolume);
        globalConfig.speedLevel = readPercentage('SpeedLevel', globalConfig.speedLevel);

        if (!globalStorage.scene) {
            globalStorage.scene = {};
        }

        let achievements = new Achievements();
        achievements.load();
        globalStorage.achievements = achievements;
    }
};


export default {
    getInstance () {
        if (!instance) {
            instance = new GlobalDataFileLoader();
        }
        return instance;
    }
}
