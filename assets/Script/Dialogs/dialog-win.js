const GlobalEventSystem = require('global-event-system');
const Score = require('score');
const DialogsFactory = require('dialogs-factory');

let globalEventSystem = GlobalEventSystem.getInstance();
let score = Score.getInstance();
let dialogsFactory = DialogsFactory.getInstance();

cc.Class({
    extends: cc.Component,


    onLoad () {
        let scoreLabel = this.node.getChildByName('Score Label');
        let scoreLabelComponent = scoreLabel.getComponent(cc.Label);
        scoreLabelComponent.string = score.points.toString();
        cc.tween(scoreLabel)
          .repeatForever(cc.tween()
            .to(1, {scale: 0.75})
            .to(1, {scale: 1.0})
          )  
          .start();
    },


    onMenuButtonClick () {
        dialogsFactory.free (this.node, () => {
            globalEventSystem.publish('dialog-win-menu-click');
        });
    }
});
