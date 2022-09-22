const RoadNetworkGraph = require('road-network-graph');
const GlobalStorage = require('global-storage');

let globalStorage = GlobalStorage.getInstance();        

cc.Class({
    extends: cc.Component,

    properties: {
        horzRoadsVisibleOnStart: false,
        vertRoadsVisibleOnStart: false,
    },


    onLoad () {
        let horzRoads = this.node.getChildByName('Horz Roads');
        let vertRoads = this.node.getChildByName('Vert Roads');

        let graph = this.buildGraph(horzRoads, vertRoads); 
        globalStorage.scene.roadNetworkGraph = graph;

        horzRoads.active = this.horzRoadsVisibleOnStart;
        vertRoads.active = this.vertRoadsVisibleOnStart;
    },


    buildGraph (horzRoads, vertRoads) {
        let getHorzRoadLength = road => road.width  * road.scaleX;
        let getVertRoadLength = road => road.height * road.scaleY;

        // simplified formula with default anchor (0.5,0.5)
        let createRoadList = function (roads, getLength) {
            let roadList = roads.map(road => {        
                let roadComponent = road.getComponent('road');    
                return {
                    id: roadComponent.getId(),
                    x: road.x,
                    y: road.y,
                    length: getLength(road),
                    direction: roadComponent.direction,
                    attr: {
                        gemsEnabled: roadComponent.gemsEnabled,
                    }
                };
            });
            return roadList;
        };

        let horzRoadList = createRoadList(
            horzRoads.children.filter(child => child.getComponent('horz-road')),
            getHorzRoadLength);
        let vertRoadList = createRoadList(
            vertRoads.children.filter(child => child.getComponent('vert-road')),
            getVertRoadLength);

        return RoadNetworkGraph.build(horzRoadList, vertRoadList);
    },
});
