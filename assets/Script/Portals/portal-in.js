const Portal = require('portal');
const PortalOut = require('portal-out');
const Directions = require('directions');

cc.Class({
    extends: Portal,

    properties: {
        exitPortal: {
            default: null,
            type: PortalOut
        }
    },


    onCollisionEnter (other, self) {        
        if (!this.exitPortal) {
            return;
        }

        let portalOut = this.getComponent('portal-out');
        if (portalOut.isCharacterInPortal(other)) {
            return;
        }

        portalOut = this.exitPortal.getComponent('portal-out');
        if (!portalOut) {
            return;
        }

        let world = other.world;
        let portalDirection = this.direction;
        let otherDirection = Directions.getDirection (world.preAabb.center, world.aabb.center);
        if (Directions.isReverse(portalDirection, otherDirection)) {
            portalOut.accept(other);
        }
    }
});
