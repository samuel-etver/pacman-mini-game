let globalConfig = {
    playerImmortal: false,
    playerLivesCountMax: 3,
    enemyToPlayerSpeedK: 0.8,
    delayAfterEnemyDie: 5,
    delayAfterPlayerDie: 5,
    harmlessEnemiesDuration: 5,   
    speedMin: 50,
    speedMax: 100,
    get speed () {
        return this.speedMin + (this.speedMax - this.speedMin) * this.speedLevel;
    },
    speedLevel: 1.0,
    soundVolume: 1.0,
    musicVolume: 1.0,
    soundOn: true,
    musicOn: true,
    skipGlobalDataFileLoader: false,
    achievementsLengthMax: 5
};

export default {
    getInstance () {
        return globalConfig;
    }
};
