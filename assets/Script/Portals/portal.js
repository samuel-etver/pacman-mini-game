const Directions = require('directions');

cc.Class({
    extends: cc.Component,

    properties: {
        direction: {
            default: Directions.NONE,
            type: Directions
        }
    },
});
