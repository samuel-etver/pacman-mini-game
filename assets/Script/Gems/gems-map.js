const GEMS_GAP_DEF = 27.0;


class GemsMap {
    positions;

    static build (roadNetworkGraph, options) {
        let gemsMap = new GemsMap();
        gemsMap.positions = GemsMapBuilder.build(roadNetworkGraph, options ?? {});
        return gemsMap;
    }

};


class GemsMapBuilder {
    static build (roadNetworkGraph, options) {
        const gemsGap = options.gemsGap ?? GEMS_GAP_DEF;
        
        let positions = this.calculateAllPositions(roadNetworkGraph.roads, options);   
        positions = this.removeNearest(positions, options);     

        return positions;
    }


    static calculateAllPositions (allRoads, options) {
        const gemsGap = options.gemsGap ?? GEMS_GAP_DEF;
        
        let createOnHorzRoad = (coord1, coord2) => { return {x: coord1, y: coord2} };
        let createOnVertRoad = (coord1, coord2) => { return {x: coord2, y: coord1} };

        let positions = [];

        allRoads.forEach (road => {
            if (road.attr.gemsEnabled) {
                let createOnRoad = road.hasHorizontalOrientation() 
                    ? createOnHorzRoad
                    : createOnVertRoad;
                let roadLength = road.length;
                let gapsCount = ((roadLength / gemsGap) << 0);
                let gapSize = gapsCount 
                    ? (roadLength / gapsCount)
                    : 0;
                let gemsCount = gapsCount + 1;
                if(road.attr.tag === 10)     {
                  cc.log("FOUND!=" + roadLength + " " + gapSize + " " + gemsCount) 
                }
                let [coord1,] = road.getRange();
                let coord2    = road.getCoord2();            
                for (let i = 0; i < gemsCount; i++) {
                    positions.push(createOnRoad(coord1 + i * gapSize, coord2));
                }
            }
        });

        return positions;
    }


    static removeNearest (positions, options) {
        let gemsGap = options.gemsGap ?? GEMS_GAP_DEF;
        let minDistance = gemsGap / 1.1;

        let newPositions = [];        

        let hasPositionsInList = function (position) {
            for (let positionInNewList of newPositions) {
                if (Math.abs(positionInNewList.x - position.x) < minDistance &&
                    Math.abs(positionInNewList.y - position.y) < minDistance) {
                    return true;
                }
            }
            return false;
        };

        positions.forEach(position => {
            if (!hasPositionsInList(position)) {
                newPositions.push(position);
            }
        });

        return newPositions;
    }
};


export default GemsMap;
