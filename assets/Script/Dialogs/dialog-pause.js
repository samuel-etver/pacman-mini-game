const GlobalEventSystem = require('global-event-system');
const DialogsFactory = require('dialogs-factory');

let globalEventSystem = GlobalEventSystem.getInstance();
let dialogsFactory = DialogsFactory.getInstance();

cc.Class({
    extends: cc.Component,


    onResumeButtonClick () {
        dialogsFactory.free (this.node, () => {
            globalEventSystem.publish('dialog-pause-resume-button-click');
        });
    },


    onMenuButtonClick () {  
        globalEventSystem.publish('dialog-pause-menu-button-click');          
    }    
});
