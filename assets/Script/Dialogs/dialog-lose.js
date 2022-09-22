const GlobalEventSystem = require('global-event-system');
const DialogsFactory = require('dialogs-factory');

let globalEventSystem = GlobalEventSystem.getInstance();
let dialogsFactory = DialogsFactory.getInstance();

cc.Class({
    extends: cc.Component,


    onMenuButtonClick () {
        dialogsFactory.free (this.node, () => {
            globalEventSystem.publish('dialog-lose-menu-click');
        });
    },


    onRetryButtonClick () {
        dialogsFactory.free (this.node, () => {
            globalEventSystem.publish('dialog-lose-retry-click');
        });
    }
});
