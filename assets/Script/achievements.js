const GlobalDataFile = require('global-data-file');
const GlobalConfig = require('global-config');

let globalDataFile = GlobalDataFile.getInstance();
let globalConfig = GlobalConfig.getInstance();

const dataFileKey = 'achievements';

class Achievements {
    constructor () {
        this.points = [];
    }


    load () {
        let loadedPoints = [];
        let dataFileArray = globalDataFile.readArray(dataFileKey);
        if (Array.isArray(dataFileArray)) {
            let n = dataFileArray.length < globalConfig.achievementsLengthMax
               ? dataFileArray.length
               : globalConfig.achievementsLengthMax;
            for (let i = 0; i < n; i++) {
                let value = parseInt(dataFileArray[i]);
                if (isNaN(value)) {
                    break;
                }
                loadedPoints.push(value);
            }
        }
        this.points = loadedPoints.sort((a, b) => b - a);
    }


    save () {
        globalDataFile.writeArray(dataFileKey, this.points);
    }


    append (newValue) {
        this.points.push(newValue);
        this.points.sort((a, b) => b - a);
        if (this.points.length > globalConfig.achievementsLengthMax) {
            this.points = this.points.slice(0, globalConfig.achievementsLengthMax);
        }
    }
};


export default Achievements;
