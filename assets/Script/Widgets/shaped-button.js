
const GlobalStorage = require('global-storage');

let globalStorage = GlobalStorage.getInstance();


cc.Class({
    extends: cc.Component,

    properties: {
        downEvent: {
            default: null,
            type: cc.Component.EventHandler
        },
        upEvent: {
            default: null,
            type: cc.Component.EventHandler
        },
        ignorePause: false
    },


    onLoad () {
        this.down = false;
        this.collider = this.getComponent(cc.Collider);                
        this.upChild = this.node.getChildByName('Up');
        this.downChild = this.node.getChildByName('Down');
        this.setDown(this.down);

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, false);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, false);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this, false);
    },


    onTouchStart (touch) {
        if (!this.ignorePause && globalStorage.scene.pauseActivated) {
            return;
        }

        let touchLocation = touch.getLocation();
        if (cc.Intersection.pointInPolygon(touchLocation, this.collider.world.points)) {
            touch.stopPropagationImmediate = true;
            this.setDown(true);
            this.downEvent?.emit();
        }
    },


    onTouchEnd () {
        if (!this.ignorePause && globalStorage.scene.pauseActivated) {
            return;
        }

        if (this.down) {
            this.setDown(false);
            this.upEvent?.emit();
        }
    },


    setDown (value) {
        this.down = value;
        this.upChild.active = !value;
        this.downChild.active = value;
    },


    isDown () {
        return this.down;
    }
});
