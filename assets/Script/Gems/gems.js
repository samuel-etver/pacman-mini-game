const GemsMap = require('gems-map');
const GlobalStorage = require('global-storage');

let globalStorage = GlobalStorage.getInstance();

cc.Class({
    extends: cc.Component,

    properties: {
        gemPrefab: {
            default: null,
            type: cc.Prefab
        }
    },


    onLoad () {     
        let roadNetworkGraph = globalStorage.scene.roadNetworkGraph;
        let gemsMap = GemsMap.build(roadNetworkGraph);   

        globalStorage.scene.numberOfGems = gemsMap.positions.length;

        let createGem = function (x, y) {
            let gem = cc.instantiate(this.gemPrefab);
            this.node.addChild(gem);
            gem.position = new cc.Vec2(x, y);
        }.bind(this);

        gemsMap.positions.forEach(position => createGem(position.x, position.y));
    },
});
