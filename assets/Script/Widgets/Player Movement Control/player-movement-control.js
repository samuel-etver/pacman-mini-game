let buttonDownEventProperty = {
    default: null,
    type: cc.Component.EventHandler
};

cc.Class({
    extends: cc.Component,

    properties: {        
        leftButtonDownEvent: buttonDownEventProperty,
        rightButtonDownEvent: buttonDownEventProperty,
        topButtonDownEvent: buttonDownEventProperty,
        bottomButtonDownEvent: buttonDownEventProperty
    },


    onLeftButtonDown () {
        this.leftButtonDownEvent?.emit([this.leftButtonDownEvent.customEventData]);
    },


    onRightButtonDown () {
        this.rightButtonDownEvent?.emit([this.rightButtonDownEvent.customEventData]);
    },


    onTopButtonDown () {
        this.topButtonDownEvent?.emit([this.topButtonDownEvent.customEventData]);
    },


    onBottomButtonDown () {
        this.bottomButtonDownEvent?.emit([this.bottomButtonDownEvent.customEventData]);
    }
});
