const Portal = require('portal');
const Directions = require('directions');
const GlobalStorage = require('global-storage');
const Geom = require('geom');

let globalStorage = GlobalStorage.getInstance();

cc.Class({
    extends: Portal,


    ctor () {
        this.roadId = undefined;
        this.exitPosition = undefined;
        this.charactersInPortal = new Set();
    },

    onLoad () {
        let direction = this.direction;
        let collider = this.getComponent(cc.BoxCollider);
        let colliderBottomLeft = {
            x: this.node.x - this.node.width/2  + collider.offset.x,
            y: this.node.y - this.node.height/2 + collider.offset.y
        };
        let colliderTopRight = {
            x: colliderBottomLeft.x + collider.size.width,
            y: colliderBottomLeft.y + collider.size.height
        };

        let allRoads = globalStorage.scene.roadNetworkGraph.roads;

        let findRoadOnWest = function () {
            let colliderLine = Geom.createLine(
                colliderBottomLeft,
                {
                    x: colliderBottomLeft.x,
                    y: colliderTopRight.y
                }
            );
            return findHorzRoad(colliderLine);
        };

        let findRoadOnEast = function () {
            let colliderLine = Geom.createLine(
                {
                    x: colliderTopRight.x,
                    y: colliderBottomLeft.y
                },
                colliderTopRight
            );
            return findHorzRoad(colliderLine);
        };

        let findRoadOnNorth = function () {
            let colliderLine = Geom.createLine(
                {
                    x: colliderBottomLeft.x,
                    y: colliderTopRight.y
                },
                colliderTopRight
            );
            return findVertRoad(colliderLine);
        };

        let findRoadOnSouth = function () {
            let colliderLine = Geom.createLine(
                colliderBottomLeft,
                {
                    x: colliderTopRight.x,
                    y: colliderBottomLeft.y
                }
            );
            return findVertRoad(colliderLine);
        };

        let findHorzRoad = function(colliderLine) {
            for (let road of allRoads) {
                if (road.hasHorizontalOrientation()) {
                    let found = Geom.areLinesIntersecting(road.getLine(), colliderLine);
                    if (found) {
                        return road.id;
                    }
                }
            }
        };


        let findVertRoad = function(colliderLine) {
            for (let road of allRoads) {
              if (road.hasVerticalOrientation()) {
                  let found = Geom.areLinesIntersecting(colliderLine, road.getLine());
                  if (found) {
                      return road.id;
                  }
              }
          }
      };
      
        let findRoad = function() {            
            switch (direction) {
                case Directions.NORTH:
                    return findRoadOnNorth();
                case Directions.SOUTH:
                    return findRoadOnSouth();
                case Directions.WEST:
                    return findRoadOnWest();
                case Directions.EAST:
                    return findRoadOnEast();
            }
        };


        let findExitPosition = function() {
            if (this.roadId !== undefined) {
                let road = allRoads.refById[this.roadId];
                let [coord1Name, coord2Name] = road.getCoordNames();                
                if (road.inRange(this.node[coord1Name])) {
                    return {
                        [coord1Name]: this.node[coord1Name],
                        [coord2Name]: road.getCoord2()
                    };
                }
            }

        }.bind(this);


        this.roadId = findRoad();
        this.exitPosition = findExitPosition();
      
    },


    accept (character) {
        if (!this.canAccept(character)) {
              return false;
        }

        this.charactersInPortal.add(character);

        let portable = character.getComponent('portable');        
        portable.move (this.roadId, this.direction, this.exitPosition);            
         
        return true;
    },


    canAccept (character) {
        if (this.roadId === undefined ||
            this.exitPosition === undefined) {
            return false;
        }

        let portable = character.getComponent('portable');
        if (!portable) {
            return false;
        }        
        
        return true;
    },


    onCollisionExit (other, self) {
        this.charactersInPortal.delete(other);
    },


    isCharacterInPortal (character) {
        return this.charactersInPortal.has(character);
    }

});
