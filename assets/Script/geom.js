class Geom {
    static between (value, value0, value1) {
        return value >= value0 && value <= value1;
    }

    

    static isCoordEqual (value1, value2) {
        return Math.abs(value1 - value2) < 0.001;
    }


    static areLinesIntersecting (horzLine, vertLine) {
        return Geom.between(horzLine.point0.y, vertLine.point0.y, vertLine.point1.y) &&
               Geom.between(vertLine.point0.x, horzLine.point0.x, horzLine.point1.x);
    }


    static getLinesIntersection (horzLine, vertLine) {
        if (Geom.areLinesIntersecting(horzLine, vertLine)) {
            return {
                x: vertLine.point0.x,
                y: horzLine.point0.y
            };
        }
    }


    static createLine (point0, point1) {
        return {
            point0: point0,
            point1: point1
        };
    }
  
};


export default Geom;
