const GlobalConfig = require('global-config');
const GlobalStorage = require('global-storage');
const GlobalEventSystem = require('global-event-system');
const GlobalDataFileLoader = require('global-data-file-loader');
const DialogsFactory = require('dialogs-factory');
const Score = require('score');

let globalConfig = GlobalConfig.getInstance();
let globalStorage = GlobalStorage.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();
let globalDataFileLoader = GlobalDataFileLoader.getInstance();
let dialogsFactory = DialogsFactory.getInstance();
let score = Score.getInstance();

cc.Class({
    extends: cc.Component,


    ctor () {
        globalDataFileLoader.load();

        this.onWin = this.onWin.bind(this);
        this.onLose = this.onLose.bind(this);  
        this.onDialogLoseMenuClick = this.onDialogLoseMenuClick.bind(this);
        this.onDialogLoseRetryClick = this.onDialogLoseRetryClick.bind(this); 
        this.onDialogWinMenuClick = this.onDialogWinMenuClick.bind(this);  
        this.onControlPanelButtonClick = this.onControlPanelButtonClick.bind(this);    
    },


    loadAndInstantiatePrefab (prefabName) {
        if (!this.node.getChildByName(prefabName)) {
            cc.resources.load('Prefab/' + prefabName, function(err, prefab) {
                let gameObject = cc.instantiate(prefab);
                this.node.addChild(gameObject);
            }.bind(this));
        }
    },


    loadControlPanel () {
        this.loadAndInstantiatePrefab('Control Panel');
    },


    loadLivesCountPanel () {
        this.loadAndInstantiatePrefab("Lives Count Panel");
    },


    onLoad () {
        let sceneData = {
            playerImmortal: globalConfig.playerImmortal,
            speed: globalConfig.speed,
            enemyToPlayerSpeedK: globalConfig.enemyToPlayerSpeedK,
            delayAfterEnemyDie: globalConfig.delayAfterEnemyDie,
            delayAfterPlayerDie: globalConfig.delayAfterPlayerDie,
            harmlessEnemiesDuration: globalConfig.harmlessEnemiesDuration,   
            superPowerDuration: globalConfig.superPowerDuration,    
            scorePoints: 0,   
            gemsCount: 0,  
            killedCount: 0,
            playerLivesCount: globalConfig.playerLivesCountMax,
            playerLivesCountMax: globalConfig.playerLivesCountMax,
            pauseActivated: false,
        };
        globalStorage.scene = sceneData; 
        
        this.loadLivesCountPanel();
        this.loadControlPanel();
    },


    onEnable () {
        cc.director.getCollisionManager().enabled = true;  
         
        globalEventSystem.subscribe('win', this.onWin);
        globalEventSystem.subscribe('lose', this.onLose);
        globalEventSystem.subscribe('dialog-lose-menu-click', this.onDialogLoseMenuClick);
        globalEventSystem.subscribe('dialog-lose-retry-click', this.onDialogLoseRetryClick);
        globalEventSystem.subscribe('dialog-win-menu-click', this.onDialogWinMenuClick);
        globalEventSystem.subscribe('control-panel-button-click', this.onControlPanelButtonClick);
    },


    onDisable () {
        globalEventSystem.unsubscribe('win', this.onWin);
        globalEventSystem.unsubscribe('lose', this.onLose);
        globalEventSystem.unsubscribe('dialog-lose-menu-click', this.onDialogLoseMenuClick);
        globalEventSystem.unsubscribe('dialog-lose-retry-click', this.onDialogLoseRetryClick);
        globalEventSystem.unsubscribe('dialog-win-menu-click', this.onDialogWinMenuClick);
        globalEventSystem.unsubscribe('control-panel-button-click', this.onControlPanelButtonClick);
    },


    onWin () {        
        globalStorage.achievements.append(score.points);
        globalStorage.achievements.save();
        dialogsFactory.execute(this, "Win Dialog");
    },


    onLose () {
        dialogsFactory.execute(this, "Lose Dialog");
    },


    onDialogLoseMenuClick () {
        this.notifyShowMainMenuScene();
    },


    onDialogLoseRetryClick () {
        this.onDisable();
        this.loadScene();
    },


    onDialogWinMenuClick () {
        this.notifyShowMainMenuScene();
    },


    notifyShowMainMenuScene () {
        globalEventSystem.publish('scene-main-menu-show');
    },


    onControlPanelButtonClick (event, buttonName) {
        if (buttonName == 'menu') {
            globalEventSystem.publish('scene-main-menu-show');
        }
    },


    loadScene (sceneName) {        
        cc.director.loadScene(sceneName ?? cc.director.getScene().name);
    }
});
