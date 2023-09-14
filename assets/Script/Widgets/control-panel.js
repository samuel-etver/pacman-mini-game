const GlobalEventSystem = require('global-event-system');

let globalEventSystem = GlobalEventSystem.getInstance();

cc.Class({
    extends: cc.Component,

    onLoad () {
        let self = this;

        let createEventHandler = function(handler, customEventData) {
            let eventHandler = new cc.Component.EventHandler();
            eventHandler.target = self.node;
            eventHandler.component = 'control-panel';
            eventHandler.handler = handler;
            eventHandler.customEventData = customEventData;
            return eventHandler;
        };

        let addPlayerMovementControlHandlers = function () {            
            let playerMovementControlNode = self.node.getChildByName('Player Movement Control');
            let playerMovementControl = playerMovementControlNode.getComponent('player-movement-control');
            let createPlayerMovementControHandler = 
              customEventData => createEventHandler('onButtonTouch', customEventData);
            playerMovementControl.leftButtonDownEvent = createPlayerMovementControHandler('left');
            playerMovementControl.rightButtonDownEvent = createPlayerMovementControHandler('right');
            playerMovementControl.topButtonDownEvent = createPlayerMovementControHandler('top');
            playerMovementControl.bottomButtonDownEvent = createPlayerMovementControHandler('bottom');
        };
        
        addPlayerMovementControlHandlers();
    },


    onButtonTouch (buttonShortName) {
        globalEventSystem.publish('control-panel-button-down', buttonShortName);
    },


    onOptionsButtonClick () {
        globalEventSystem.publish('control-panel-button-click', 'options');
    },


    onPauseButtonClick () {
        globalEventSystem.publish('control-panel-button-click', 'pause');
    }
});
