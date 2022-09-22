const GlobalConfig = require('global-config');
const GlobalEventSystem = require('global-event-system');
const GlobalDataFile = require('global-data-file');
let DialogsFactory = require('dialogs-factory');

let globalConfig = GlobalConfig.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();
let globalDataFile = GlobalDataFile.getInstance();
let dialogsFactory = DialogsFactory.getInstance();

cc.Class({
    extends: cc.Component,


    onLoad () {
        this.musicOn = globalConfig.musicOn;
        this.soundOn = globalConfig.soundOn;
        this.speedLevel = globalConfig.speedLevel;
        this.musicVolume = globalConfig.musicVolume;
        this.soundVolume = globalConfig.soundVolume;

        let setToggle = (objectName, value) => {
            let toggleObject = this.node.getChildByName(objectName);
            let toggleComponent = toggleObject.getComponent(cc.Toggle);
            toggleComponent.isChecked = value;
        };

        let setSliderProgress = (objectName, value) => {
            let sliderObject = this.node.getChildByName(objectName);
            let sliderComponent = sliderObject.getComponent(cc.Slider);
            sliderComponent.progress = value;
        };

        setToggle('Music Toggle', this.musicOn);
        setToggle('Sound Toggle', this.soundOn);
        setSliderProgress('Speed Level Slider', this.speedLevel);
        setSliderProgress('Music Volume Slider', this.musicVolume);
        setSliderProgress('Sound Volume Slider', this.soundVolume);
    },


    onEnable () {
        this.schedule(this.onSaveTick, 0.2, cc.macro.REPEAT_FOREVER, 1);
    },


    onDisable () {
        this.unscheduleAllCallbacks();
        this.save();
    },


    onCloseButtonClick () {
        dialogsFactory.free(this.node);
    },


    onSpeedLevelSlide (slider) {
        this.speedLevel = slider.progress;
    },


    onMusicVolumeSlide (slider) {
        this.musicVolume = slider.progress;
    },


    onSoundVolumeSlide (slider) {
        this.soundVolume = slider.progress;
    },


    onMusicOnToggle (toggle) {
        this.musicOn = toggle.isChecked;
    },


    onSoundOnToggle (toggle) {
        this.soundOn = toggle.isChecked;
    },


    onSaveTick () {
        this.save();
    },
    
    
    save () {
        if (this.speedLevel != globalConfig.speedLevel) {
            globalConfig.speedLevel = this.speedLevel;
            globalDataFile.writeFloat('SpeedLevel', this.speedLevel);   
            globalEventSystem.publish('speed-level-changed');         
        }

        if (this.musicOn != globalConfig.musicOn) {
            globalConfig.musicOn = this.musicOn;
            globalDataFile.writeBool('MusicOn', this.musicOn);
            globalEventSystem.publish('music-on-toggled');
        }

        if (this.soundOn != globalConfig.soundOn) {
            globalConfig.soundOn = this.soundOn;
            globalDataFile.writeBool('SoundOn', this.soundOn);
            globalEventSystem.publish('sound-on-toggled');
        }

        if (this.musicVolume != globalConfig.musicVolume) {
            globalConfig.musicVolume = this.musicVolume;
            globalDataFile.writeFloat('MusicVolume', this.musicVolume);
            globalEventSystem.publish('music-volume-changed');
        }

        if (this.soundVolume != globalConfig.soundVolume)  {
            globalConfig.soundVolume = this.soundVolume;
            globalDataFile.writeFloat('SoundVolume', this.soundVolume);
            globalEventSystem.publish('sound-volume-changed');
        }
    }
});
