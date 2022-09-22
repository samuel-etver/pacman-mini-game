const Road = require('road');
const VerticalDirections = require('directions-vertical');

cc.Class({
    extends: Road,

    properties: {
        direction: {
            default: VerticalDirections.NONE,
            type: VerticalDirections,
        }
    },


    isOneWay () {
        return this.direction !== VerticalDirections.NONE;
    }
});
