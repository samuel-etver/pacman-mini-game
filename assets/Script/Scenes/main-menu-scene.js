const GlobalEventSystem = require('global-event-system');
const GlobalDataFileLoader = require('global-data-file-loader');
const GlobalStorage = require('global-storage');
const DialogsFactory = require('dialogs-factory');

let globalEventSystem = GlobalEventSystem.getInstance();
let globalDataFileLoader = GlobalDataFileLoader.getInstance();
let globalStorage = GlobalStorage.getInstance();
let dialogsFactory = DialogsFactory.getInstance();

let MainMenu = cc.Class({
    extends: cc.Component,

    ctor () {
        globalDataFileLoader.load();
    },


    onLoad () {
        globalStorage.scene = Object.assign(globalStorage.scene, {
            pauseActivated: false
        });

        cc.director.getCollisionManager().enabled = true;           
    },


    onPlayButtonClick () {
        globalEventSystem.subscribe('scene-main-menu-show', MainMenu.onMainMenuSceneShow);
        cc.director.loadScene('game-scene1');
    },


    onOptionsButtonClick () {
        dialogsFactory.execute(this.node, 'Options Dialog');
    },


    onAchievementsButtonClick () {
        dialogsFactory.execute(this.node, 'Achievements Dialog');
    },


    statics: {
        onMainMenuSceneShow () {
            globalEventSystem.unsubscribe('scene-main-menu-show', MainMenu.onMainMenuSceneShow);
            cc.director.loadScene('main-menu');
        },
    },
});
