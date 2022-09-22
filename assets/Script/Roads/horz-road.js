const Road = require('road');
const HorizontalDirections = require('directions-horizontal');

cc.Class({
    extends: Road,

    properties: {
        direction: {
            default: HorizontalDirections.NONE,
            type: HorizontalDirections,
        }
    },


    isOneWay () {
        return this.direction !== HorizontalDirections.NONE;
    }
});
