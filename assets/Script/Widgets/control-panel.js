const GlobalEventSystem = require('global-event-system');

let globalEventSystem = GlobalEventSystem.getInstance();

cc.Class({
    extends: cc.Component,

    onLoad () {
        let createEventHandler = function(handler, customEventData) {
            let eventHandler = new cc.Component.EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = 'control-panel';
            eventHandler.handler = handler;
            eventHandler.customEventData = customEventData;
            return eventHandler;
        }.bind(this);
        
        let addButtonEventHandlers = function(frame) {
            let buttonName = frame.name;
            let shortName = buttonName.replace(/\s+Button/, '').replace(/\s+/, '-').toLowerCase();
            let clickEventHandler = createEventHandler('onButtonClick', shortName);
            let button = this.node.getChildByName(buttonName).getComponent(cc.Button);
            button.clickEvents.push(clickEventHandler);
            this.node.getChildByName(buttonName).on('touchstart', () => this.onButtonTouch(shortName), this.node);
        }.bind(this);  

        let addPlayerMovementControlHandlers = function () {            
            let playerMovementControlNode = this.node.getChildByName('Player Movement Control');
            let playerMovementControl = playerMovementControlNode.getComponent('player-movement-control');
            let createPlayerMovementControHandler = 
              customEventData => createEventHandler('onButtonTouch', customEventData);
            playerMovementControl.leftButtonDownEvent = createPlayerMovementControHandler('left');
            playerMovementControl.rightButtonDownEvent = createPlayerMovementControHandler('right');
            playerMovementControl.topButtonDownEvent = createPlayerMovementControHandler('top');
            playerMovementControl.bottomButtonDownEvent = createPlayerMovementControHandler('bottom');
        }.bind(this);
        
        let buttonFrames = this.node.children.filter(node => node.getComponent(cc.Button) !== null);
        buttonFrames.forEach(frame => addButtonEventHandlers(frame));
        addPlayerMovementControlHandlers();
    },


    onButtonTouch (buttonShortName) {
        globalEventSystem.publish('control-panel-button-down', buttonShortName);
    },


    onButtonClick (event, buttonShortName) {
        globalEventSystem.publish('control-panel-button-click', buttonShortName);
    },
});
