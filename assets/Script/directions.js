let Directions = cc.Enum({
    NONE: 0,
    NORTH: 1,
    SOUTH: 2,
    EAST: 3,
    WEST: 4,
});

let rotations = {
    [Directions.NORTH]: 90,
    [Directions.SOUTH]: -90,
    [Directions.WEST]: 0,
    [Directions.EAST]: 0
};

let scales = {
    [Directions.NORTH]: 1,
    [Directions.SOUTH]: 1,
    [Directions.WEST]: -1,
    [Directions.EAST]: 1
};


let allDirections = [
    Directions.NONE,
    Directions.NORTH,
    Directions.SOUTH,
    Directions.EAST,
    Directions.WEST
];


Directions.getAll = function () {
    return allDirections;
};


Directions.getReverse = function (direction) {
    switch (direction) {
        case this.NORTH:
            return this.SOUTH;
        case this.SOUTH:
            return this.NORTH;
        case this.WEST:
            return this.EAST;
        case this.EAST:
            return this.WEST;                        
    }
    return direction;
};


Directions.isReverse = function (direction1, direction2) {
    return Directions.getReverse(direction1) == direction2;
};


Directions.getDirection = function (fromPos, toPos) {
    let dx = toPos.x - fromPos.x;
    let dy = toPos.y - fromPos.y;

    let absDx = Math.abs(dx);
    let absDy = Math.abs(dy);

    if (absDx == absDy) {
        return Directions.NONE;
    }

    let getDirectionOnLine = function (delta, directionDec, directionInc) { 
        return delta < 0 ? directionDec : directionInc;
    };

    return getDirectionOnLine(...(absDx > absDy 
        ? [dx, Directions.WEST, Directions.EAST]
        : [dy, Directions.SOUTH, Directions.NORTH]));
};


Directions.getText = function (direction) {    
    switch (direction) {
        case Directions.NORTH:
            return 'north';
        case Directions.SOUTH:
            return 'sourth';
        case Directions.WEST:
            return 'west';
        case Directions.EAST:
            return 'east';
        case Directions.NONE:
            return 'none';
    }
    return '';
};


Directions.getRotation = function(direction) {
    return rotations[direction];
};


Directions.getScale = function(direction) {
    return scales[direction];
};


export default Directions;
