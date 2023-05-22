const Geom = require('geom');

const Directions = require('directions');

const MAGNETIC_FIELD_DEF = 10;
const CHECK_GRAPH_CONNECTIVITY = true;

const HORZ_ROAD = 1;
const VERT_ROAD = 2;


class RoadNetworkGraph {
    roads;
    crossroads;

    getNextCrossroad (position, direction, roadId) {
        if (direction === undefined ||
            direction === Directions.NONE) {
            return;
        }

        let road = this.roads.refById[roadId];
        if (road === undefined) {
            return;
        }

        let coord1Name = road.getCoord1Name();
        let positionCoord1 = position[coord1Name];

        let crossroadIds = road.crossroadIds;
        let foundCrossroad;

        if (!crossroadIds.length) {
            return undefined;
        }
        
        switch (direction) {
            case Directions.WEST:
            case Directions.SOUTH:                
                for (let i = crossroadIds.length - 1; i >= 0; i--) {
                    let id = crossroadIds[i];
                    foundCrossroad = this.crossroads.refById[id];
                    if (foundCrossroad[coord1Name] < positionCoord1) {
                        break;
                    }
                }
                break;

            case Directions.EAST:
            case Directions.NORTH:
                for (let i = 0; i < crossroadIds.length; i++) {
                    let id = crossroadIds[i];
                    foundCrossroad = this.crossroads.refById[id];
                    if (foundCrossroad[coord1Name] > positionCoord1) {
                        break;
                    }
                }
        }

        return foundCrossroad;
    }    


    findNearestPositionOnRoad (position) {
        let findNearestRoad = function (allRoads) {
            let minDistance = Number.MAX_VALUE;

            for (let road of allRoads) {
                let [coord1, coord2] = [position[road.getCoord1Name()],
                                        position[road.getCoord2Name()]];
                if (road.inRange(coord1)) {
                    let distance = Math.abs(coord2 - road.getCoord2());
                    if (distance < minDistance) {
                        minDistance = distance;
                        var foundRoad = road;
                    }
                }
            }

            return foundRoad;
        };

        let nearestRoad = findNearestRoad(this.roads);
        if (!nearestRoad) {
            return;
        }

        let coord1Name = nearestRoad.getCoord1Name();
        let coord2Name = nearestRoad.getCoord2Name();

        return {
            roadId: nearestRoad.id,
            [coord1Name]: position[coord1Name],
            [coord2Name]: nearestRoad.getCoord2()
        };
    }


    getRandomPosition () {
        let index = Math.floor(Math.random() * this.roads.length);
        let road = this.roads[index];
        return {
            id: road.id,       
            [road.getCoord1Name()]: road.getRange()[0] + Math.random() * road.length,     
            [road.getCoord2Name()]: road.getCoord2()
        };
    }

    
    hasRoadTowardsDirection (crossroad, direction) {
        if (crossroad.hasRoadTowardsDirection(direction)) {
            let roadId = crossroad.getRoadIdTowardsDirection(direction);
            let road = this.roads.refById[roadId];
            if (road.isOneWay()) {
                return road.direction == direction;
            }
            return true;
        }
        return false;
    }


    static build(horzRoads, vertRoads, options) {
        let graph = GraphBuilder.build(horzRoads, vertRoads, options);
        if (CHECK_GRAPH_CONNECTIVITY) {
            let connectivity = GraphBuilder.checkGraphConnectivity(graph);
            if (!connectivity) {
                cc.warn("Road graph is diconnected!");                
            }
        }
        return graph;
    }
};


class Road {
    id;
    x;
    y;
    length;
    attr;
    orientation;
    direction;
    crossroadIds = [];

    getRange () { 
        let pos0 = this.getCoord1() - this.length / 2.0;
        let pos1 = pos0 + this.length;
        return [pos0, pos1];
    }


    setRange (pos0, pos1) {
        this.setCoord1((pos0 + pos1) / 2.0);
        this.length = pos1 - pos0;
    }


    inRange (pos) {
        let [pos0, pos1] = this.getRange();
        return Geom.between(pos, pos0, pos1); 
    }


    isCoord2Equal (road) {
        return Geom.isCoordEqual(this.getCoord2(), road.getCoord2());
    }


    hasVerticalOrientation () {
        return this.orientation == VERT_ROAD;
    }


    hasHorizontalOrientation () {
        return this.orientation == HORZ_ROAD;
    }


    getX0 () { 
        return this.hasHorizontalOrientation()
          ? this.x - this.length / 2.0
          : this.x; 
    }


    getX1 () {
        return this.hasHorizontalOrientation()
          ? this.getX0() + this.length
          : this.x; 
    }


    getY0 () { 
        return this.hasHorizontalOrientation()
          ? this.y 
          : (this.y - this.length / 2.0);
    }

    
    getY1 () {
      return this.hasHorizontalOrientation()
        ? this.y 
        : (this.getY0() + this.length);
    }


    getCoord1Name () {
        return this.hasHorizontalOrientation() ? 'x' : 'y';
    }


    getCoord2Name () {
        return this.hasHorizontalOrientation() ? 'y' : 'x';
    }


    getCoordNames () {
        return [this.getCoord1Name(), this.getCoord2Name()];
    }


    getCoord1 () {
        return this[this.getCoord1Name()];  
    }


    setCoord1 (value) { 
        this[this.getCoord1Name()] = value;
    }


    getCoord2 () { 
        return this[this.getCoord2Name()];  
    }


    setCoord2 (value) {
        this[this.getCoord2Name()] = value; 
    }


    getLine () {
        return Geom.createLine(
            { x: this.getX0(), y: this.getY0() },
            { x: this.getX1(), y: this.getY1() }
        );
    }


    getAvailableDirections () {
        if (this.isOneWay()) {
            return [this.direction];
        }

        if (this.hasVerticalOrientation()) {
            return [
                Directions.NORTH,
                Directions.SOUTH
            ];
        }

        if (this.hasHorizontalOrientation()) {
            return [
                Directions.WEST,
                Directions.EAST
            ];
        }

        return [];
    }


    isOneWay () {
        return this.direction !== Directions.NONE;
    }
};


class Crossroad {
    static #nextCrossroadId = 1;

    id = Crossroad.#nextCrossroadId++;
    x;
    y;
    roadIds = [];
    directions = {};


    equal (crossroad) {
        return Geom.isCoordEqual(this.x, crossroad.x) &&
               Geom.isCoordEqual(this.y, crossroad.y);
    }


    hasRoad (id) {
        return this.roadIds.find(value => id == value);
    }


    hasRoadTowardsDirection (direction) {
        return this.directions[direction] !== undefined;
    }
    

    getRoadIdTowardsDirection (direction) {
        return this.directions[direction];
    }
};


class GraphBuilder {
    static build (horzRoads, vertRoads, options) {
        options = options ?? {};

        let allRoads = this.adjustRoads(horzRoads, vertRoads, options);
        this.createReferenceById(allRoads, options);
        let allCrossroads = this.findAllCrossroads(allRoads, options);
        this.createReferenceById(allCrossroads, options);
        this.bindCrossroadsToRoads(allRoads, allCrossroads, options);

        let graph = new RoadNetworkGraph();
        graph.roads = allRoads;
        graph.crossroads = allCrossroads;
        return graph;
    }


    static adjustRoads (horzRoads, vertRoads, options) {
        const magneticField = options.magneticField ?? MAGNETIC_FIELD_DEF;

        let iterate = this.iterateList;

        let extent = function (roads, ext) {
            return roads.map(road => Object.assign(new Road(), road, ext));
        };


        let iterateIfCoord2Equal = function (roads, proc) {
            iterate (roads, (iRoad, jRoad) => {
                if (iRoad.isCoord2Equal(jRoad)) {
                    proc(iRoad, jRoad);
                }
            });
        };


        let magnetizeCoord2 = function (roads) {
            iterate (roads, (iRoad, jRoad) => {
                if (Math.abs(iRoad.getCoord2() - jRoad.getCoord2()) < magneticField) {
                    jRoad.setCoord2(iRoad.getCoord2());
                }
            });
        };


        let magnetizeCoord1 = function (roads) {
            iterateIfCoord2Equal (roads, (iRoad, jRoad) => {
                let [iPos0, iPos1] = iRoad.getRange();
                let [jPos0, jPos1] = jRoad.getRange();
                if (Geom.between(iPos0 - jPos1, 0, magneticField)) {
                    jRoad.setRange(jPos0, iPos0);
                }
                else if (Geom.between(jPos0 - iPos1, 0, magneticField)) {
                    jRoad.setRange(iPos1, jPos1);
                }
            });
        };


        let magnetizeCoord1ToCross = function (editingRoads, referenceRoads) {
            for (let currReferenceRoad of referenceRoads) {
                let referenceRoadCoord2 = currReferenceRoad.getCoord2();

                for (let currEditingRoad of editingRoads) {
                    let [editingRoadPos0, editingRoadPos1] = currEditingRoad.getRange();
                    let changePos0 = Geom.between(referenceRoadCoord2 - editingRoadPos0,
                                                  -magneticField, magneticField);
                    let changePos1 = Geom.between(referenceRoadCoord2 - editingRoadPos1, 
                                                  -magneticField, magneticField);      
                    if (changePos0 || changePos1) {   
                        currEditingRoad.setRange(changePos0 ? referenceRoadCoord2 : editingRoadPos0,
                                                 changePos1 ? referenceRoadCoord2 : editingRoadPos1);
                    }       
                }
            }
        };


        let removeInners = function (roads) {
            roads = roads.sort((road1, road2) => {
                if (road1.length > road2.length) return 1;
                if (road1.length < road2.length) return -1;
                return 0;
            });

            iterateIfCoord2Equal (roads, (iRoad, jRoad) => {
                let [iPos0, iPos1] = iRoad.getRange();
                if (jRoad.inRange(iPos0) &&
                    jRoad.inRange(iPos1)) {
                    iRoad.checkedToRemove = true;      
                }
            });

            return roads.filter(road => !road.checkedToRemove);
        };


        let trimLength = function (roads) {
            iterateIfCoord2Equal(roads, (iRoad, jRoad) => {
                let [iPos0, iPos1] = iRoad.getRange();
                let [jPos0, jPos1] = jRoad.getRange();
                if (Geom.between(iPos0, jPos0, jPos1)) {
                    iRoad.setRange(jPos1, iPos1); 
                } else if (Geom.between(iPos1, jPos0, jPos1)) {
                    iRoad.setRange(iPos0, jPos0);
                }
            });
        };     


        let removeZeroLength = function (roads) {
            return roads.filter(road => road.length > 0);
        };


        let joinToOne = function (horzRoads, vertRoads) {
            return horzRoads.concat(vertRoads);
        };


        horzRoads = extent(horzRoads, {
            orientation: HORZ_ROAD
        });
        vertRoads = extent(vertRoads, {
            orientation: VERT_ROAD
        });

        magnetizeCoord2(horzRoads);
        magnetizeCoord2(vertRoads);

        magnetizeCoord1(horzRoads);
        magnetizeCoord1(vertRoads);

        magnetizeCoord1ToCross(horzRoads, vertRoads);
        magnetizeCoord1ToCross(vertRoads, horzRoads);

        horzRoads = removeInners(horzRoads);
        vertRoads = removeInners(vertRoads);

        trimLength(horzRoads);
        trimLength(vertRoads);

        horzRoads = removeZeroLength(horzRoads);
        vertRoads = removeZeroLength(vertRoads);

        let allRoads = joinToOne(horzRoads, vertRoads);

        return allRoads;
    }


    static createReferenceById (o) {
        o.refById = {};
        o.forEach(item => o.refById[item.id] = item);
    }


    static findAllCrossroads (allRoads, options) {        
        const magneticField = options.magneticField ?? MAGNETIC_FIELD_DEF;

        let iterate = this.iterateList;

        const horzOrientation = HORZ_ROAD;

        let findAll = function (allRoads) {
            let crossroads = [];

            let appendCrossroad = function (x, y, ids) {
                let newCrossroad = new Crossroad();
                newCrossroad.x = x;
                newCrossroad.y = y;
                newCrossroad.roadIds.push(...ids);        
                crossroads.push(newCrossroad);
            };

            allRoads.forEach(road => {  
                let [pos0, pos1] = road.getRange();
                let coord2 = road.getCoord2();
                let [coord1Name, coord2Name] = road.getCoordNames();
                let position = {
                    [coord1Name]: pos0,
                    [coord2Name]: coord2
                };
                appendCrossroad(position.x, position.y, [road.id]);
                position[coord1Name] = pos1;
                appendCrossroad(position.x, position.y, [road.id]);
            });

            iterate(allRoads, (iRoad, jRoad) => {
                let crossroadX;
                let crossroadY;
                let [iRoadX0, iRoadY0] = [iRoad.getX0(), iRoad.getY0()];
                let [iRoadX1, iRoadY1] = [iRoad.getX1(), iRoad.getY1()];
                let [jRoadX0, jRoadY0] = [jRoad.getX0(), jRoad.getY0()];
                let [jRoadX1, jRoadY1] = [jRoad.getX1(), jRoad.getY1()];
                if (Geom.isCoordEqual(iRoadX0, jRoadX0) && Geom.isCoordEqual(iRoadY0, jRoadY0) ||
                    Geom.isCoordEqual(iRoadX0, jRoadX1) && Geom.isCoordEqual(iRoadY0, jRoadY1)) {
                    crossroadX = iRoadX0;
                    crossroadY = iRoadY0;
                }
                else if (Geom.isCoordEqual(iRoadX1, jRoadX0) && Geom.isCoordEqual(iRoadY1, jRoadY0) ||
                         Geom.isCoordEqual(iRoadX1, jRoadX1) && Geom.isCoordEqual(iRoadY1, jRoadY1)) {
                    crossroadX = iRoadX1;
                    crossroadY = iRoadY1;        
                }
                else if (iRoad.orientation != jRoad.orientation && (
                         iRoad.inRange(jRoad.getCoord2()) &&
                         jRoad.inRange(iRoad.getCoord2()))) {
                    [crossroadX, crossroadY] = iRoad.orientation == horzOrientation
                        ? [jRoad.getCoord2(), iRoad.getCoord2()] 
                        : [iRoad.getCoord2(), jRoad.getCoord2()];
                }
    
                if (crossroadX !== undefined) {
                    appendCrossroad(crossroadX, crossroadY, [iRoad.id, jRoad.id]);
                }
            });

            return crossroads;
        };


        let joinSame = function (allCrossroads) {
            let resultCrossroads = [];

            for (let currCrossroad of allCrossroads) {
                let found = false;
                for (let appendedCrossroad of resultCrossroads) {
                    if (currCrossroad.equal(appendedCrossroad)) {
                        currCrossroad.roadIds.forEach(id => {
                            if (!appendedCrossroad.hasRoad(id)) {
                                appendedCrossroad.roadIds.push(id);
                            }
                        });
                        found = true;
                    }
                }
                if (!found) {
                    resultCrossroads.push(currCrossroad);
                }
            }            

            return resultCrossroads;
        };


        let findAvailableDirections = function (allCrossroads) {
            let hasDirection = value => !Geom.between(value, 0, magneticField);

            allCrossroads.forEach(crossroad => {
                let setDirection = (direction, road) => crossroad.directions[direction] = road.id;

                crossroad.roadIds.forEach(id => {
                    let road = allRoads.refById[id];
                    let [pos0, pos1] = road.getRange();
                    switch(road.orientation) {
                        case horzOrientation: 
                            if (hasDirection(crossroad.x - pos0)) setDirection(Directions.WEST, road);
                            if (hasDirection(pos1 - crossroad.x)) setDirection(Directions.EAST, road);
                            break;                        
                        default: 
                            if (hasDirection(crossroad.y - pos0)) setDirection(Directions.SOUTH, road);
                            if (hasDirection(pos1 - crossroad.y)) setDirection(Directions.NORTH, road);
                    }
                });
            });
        };


        let allCrossroads = findAll(allRoads);
        allCrossroads = joinSame(allCrossroads);
        findAvailableDirections(allCrossroads);

        return allCrossroads;
    }


    static bindCrossroadsToRoads (allRoads, allCrossroads) {
        let compareByCoord = function (coordName, crossroadId1, crossroadId2) {
            let crossroad1 = allCrossroads.refById[crossroadId1];
            let crossroad2 = allCrossroads.refById[crossroadId2];
            let coord1 = crossroad1[coordName];
            let coord2 = crossroad2[coordName];
            if (coord1 > coord2) return 1;
            if (coord1 < coord2) return -1;
            return 0;
        };
        let compareByX = (crossroadId1, crossroadId2) => compareByCoord('x', crossroadId1, crossroadId2);
        let compareByY = (crossroadId1, crossroadId2) => compareByCoord('y', crossroadId1, crossroadId2);

        for (let road of allRoads) {
            let crossroadIds = [];
            for (let crossroad of allCrossroads) {
                if (crossroad.hasRoad(road.id)) {
                    crossroadIds.push(crossroad.id);    
                }
            }
            if (crossroadIds.length) {
                let compare = road.orientation == HORZ_ROAD
                    ? compareByX
                    : compareByY;
                road.crossroadIds = crossroadIds.sort(compare);
            }
        }
    }


    static getGraphConnectivity (graph) {
        let allRoads = graph.roads;
        let allCrossroads = graph.crossroads;

        let srcRoadIds = new Set();
        let dstRoadIds;
        let allGraphs = [];

        allRoads.forEach(road => srcRoadIds.add(road.id));

        let walk = function () {
            dstRoadIds = new Set();
            let roadId = srcRoadIds.values().next().value;
            srcRoadIds.delete(roadId);       
            dstRoadIds.add(roadId);
            goOnRoad(roadId);    
            return dstRoadIds; 
        };
        let goOnRoad = function (roadId) {
            let road = allRoads.refById[roadId];
            road.crossroadIds.forEach(crossroadId => scanCrossroad(crossroadId));
        };
        let scanCrossroad = function (crossroadId) {
            let crossroad = allCrossroads.refById[crossroadId];
            for (let roadId of crossroad.roadIds) {
                if (srcRoadIds.has(roadId)) {
                    srcRoadIds.delete(roadId);
                    dstRoadIds.add(roadId);
                    goOnRoad(roadId);
                }
            }
        };

        while (srcRoadIds.size) {
            allGraphs.push(walk());
        }

        return allGraphs;
    }


    static checkGraphConnectivity (graph) {
        return this.getGraphConnectivity(graph).length == 1;
    }


    static iterateList (list, proc) {
        let n = list.length;
        for (let i = 0; i < n - 1; i++) {
            let iItem = list[i];
            for (let j = i + 1; j < n; j++) {
                let jItem = list[j];
                proc(iItem, jItem);
            }
        }
    }
};

export default RoadNetworkGraph;
