const GlobalEventSystem = require('global-event-system');

let globalEventSystem = GlobalEventSystem.getInstance();

let countdownText = [
    '3', '2', '1', 'GO!'
];

cc.Class({
    extends: cc.Component,


    onLoad () {
      this.countdownTextIndex = 0;

      this.label = this.getComponent(cc.Label);
      this.updateLabel();
    },


    start () {
        this.schedule(this.onCountdownTimer, 1.0, countdownText.length - 1);
    },


    updateLabel () {
        this.label.string = countdownText[this.countdownTextIndex];
    },


    onCountdownTimer() {
        this.updateLabel();
        cc.log(this.countdownTextIndex++)
    },
});
