const GlobalStorage = require('global-storage');
const GlobalEventSystem = require('global-event-system');
const Directions = require('directions');

let globalStorage = GlobalStorage.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();

const rankLow  = -1000;

let EnemyShaderStatus = {
    NONE: 0,
    NORMAL: 1,
    HARMLESS_1: 2,
    HARMLESS_2: 3
};


cc.Class({
    extends: cc.Component,

    ctor () {
        this.roadNetworkGraph = undefined;
        this.currentDirection = undefined;
        this.currentRoadId = undefined;
        this.initialPosition = undefined;
        this.initialDirection = undefined;   
        this.movementEnabled = false;
        this.rankNormal = 0;
        this.alive = true;
        this.currentShaderStatus = EnemyShaderStatus.NONE;
        this.requeredShaderStatus = EnemyShaderStatus.NORMAL;
    },


    onLoad () {
        this.roadNetworkGraph = globalStorage.scene.roadNetworkGraph;
        
        [
            'portable',
            'damageable',
            'rankable',
            'fightable'
        ].forEach(intfName => this.getComponent(intfName).delegate = this);

        this.rankable = this.getComponent('rankable');
        this.rankNormal = this.rankable.getRank();

        this.initialPosition = this.findInitialPosition();
        if (this.initialPosition) {
            this.moveToInitialPosition();
        }

        this.initialDirection = 
        this.currentDirection = this.findInitialDirection();

        this.onPlayerStarted = this.onPlayerStarted.bind(this);        
        globalEventSystem.subscribe('player-started', this.onPlayerStarted);

        this.onPlayerStopped = this.onPlayerStopped.bind(this);
        globalEventSystem.subscribe('player-stopped', this.onPlayerStopped);

        this.onEnemyHarmless = this.onEnemyHarmless.bind(this);
        globalEventSystem.subscribe('enemies-harmless', this.onEnemyHarmless);

        this.onGamePause = this.onGamePause.bind(this);
        globalEventSystem.subscribe('game-pause', this.onGamePause);

        this.onGameResume = this.onGameResume.bind(this);
        globalEventSystem.subscribe('game-resume', this.onGameResume);

        this.enemyBody = this.node.getChildByName('Body');
        this.enemyEyesDown = this.node.getChildByName('Eyes Down');
        this.enemyEyesUp   = this.node.getChildByName('Eyes Up');
        this.enemyEyesRight = this.node.getChildByName( 'Eyes Right');
        this.enemyEyesLeft = this.node.getChildByName('Eyes Left');
        this.enemyMaterials = [];
        [
          this.enemyBody,
          this.enemyEyesDown,
          this.enemyEyesUp,
          this.enemyEyesRight,
          this.enemyEyesLeft
        ].forEach(part => {
            let sprite = part.getComponent(cc.Sprite);
            let material = sprite.getMaterial(0);
            this.enemyMaterials.push(material);
        });

        this.node.active = false;
    },


    onDestroy () {
        globalEventSystem.unsubscribe('player-started', this.onPlayerStarted);
        globalEventSystem.unsubscribe('player-stopped', this.onPlayerStopped);
        globalEventSystem.unsubscribe('enemies-harmless', this.onEnemyHarmless);
        globalEventSystem.unsubscribe('game-pause', this.onGamePause);
        globalEventSystem.unsubscribe('game-resume', this.onGameResume);

        this.unscheduleAllCallbacks();
    },


    onPlayerStarted () {
        this.startGame();
    },


    onPlayerStopped () {
        this.stopGame();
    },


    onEnemyHarmless () {
        this.unschedule(this.onEnemyHarmlessTimeout);
        this.setRankLow();
        this.requeredShaderStatus = this.currentShaderStatus === EnemyShaderStatus.HARMLESS_1 
          ? EnemyShaderStatus.HARMLESS_2
          : EnemyShaderStatus.HARMLESS_1;
        this.scheduleOnce(this.onEnemyHarmlessTimeout,
          globalStorage.scene.harmlessEnemiesDuration);
    },


    onEnemyHarmlessTimeout () {
        this.setRankNormal();
        this.requeredShaderStatus = EnemyShaderStatus.NORMAL;
    },


    startGame () {
        this.moveToInitialPosition();
        this.currentDirection = this.initialDirection;
        this.movementEnabled = true;
        this.node.active = true;
        this.activateEnemy();
    },


    stopGame () {
        this.movementEnabled = false;
        this.unscheduleAllCallbacks();
    },


    findInitialPosition () {
        return this.roadNetworkGraph.findNearestPositionOnRoad(this.node);
    },


    moveToInitialPosition () {
        this.currentRoadId = this.initialPosition.roadId;
        this.node.x = this.initialPosition.x;
        this.node.y = this.initialPosition.y;
    },


    findInitialDirection () {
        if (this.currentRoadId !== undefined) {
            let road = this.roadNetworkGraph.roads.refById[this.currentRoadId];
            let availableDirections = road.getAvailableDirections();
            return this.getRandomDirection(availableDirections);
        }
    },


    getRandomDirection (directions) {
        let index = Math.floor(directions.length * Math.random());
        if (index < directions.length) {
            return directions[index];
        }
    },


    update (dt) {        
        this.movementEnabled && this.updatePosition(dt);
        this.updateAnimation();
    },


    updatePosition (dt) {
        let distance = dt * this.getSpeed();

        if (this.currentRoadId === undefined) {
            return;
        }
        
        let currentPosition = {
            x: this.node.x,
            y: this.node.y
        };

        let calculateNextPosition = function (maxRoute) {
            maxRoute = maxRoute ?? 2;
            let nextCrossroad = this.roadNetworkGraph.getNextCrossroad(
                currentPosition,
                this.currentDirection,
                this.currentRoadId
            );
            if (nextCrossroad) {
                let road = this.roadNetworkGraph.roads.refById[this.currentRoadId];
                let coord1Name = road.getCoord1Name();
                let distanceToCrossroad = Math.abs(nextCrossroad[coord1Name] - this.node[coord1Name]);
                if (distanceToCrossroad > distance) {
                    switch (this.currentDirection) {
                        case Directions.WEST:
                        case Directions.SOUTH:
                            currentPosition[coord1Name] -= distance;
                            break;
                        case Directions.EAST:    
                        case Directions.NORTH:
                            currentPosition[coord1Name] += distance;
                    }
                }
                else {
                    distance -= distanceToCrossroad;
                    currentPosition.x = nextCrossroad.x;
                    currentPosition.y = nextCrossroad.y;
                    let availableDirections = Directions.getAll()
                      .filter(direction => this.roadNetworkGraph.hasRoadTowardsDirection(nextCrossroad, direction));
                    if (availableDirections.length > 1) {
                        let reverseDirection = Directions.getReverse(this.currentDirection);
                        availableDirections = availableDirections.filter(direction => direction != reverseDirection);
                    }
                    this.currentDirection =
                      availableDirections[Math.floor(Math.random() * availableDirections.length)];
                    this.currentRoadId = nextCrossroad.getRoadIdTowardsDirection(this.currentDirection);
                    maxRoute > 1 && calculateNextPosition(maxRoute - 1);
                }
            }
        }.bind(this);
    
        calculateNextPosition();

        this.node.x = currentPosition.x;
        this.node.y = currentPosition.y;
    },


    getSpeed () {
        return globalStorage.scene.speed * globalStorage.scene.enemyToPlayerSpeedK;
    },


    forceMove (roadId, direction, position) {        
        this.currentRoadId = roadId;
        this.currentDirection = direction;
        this.node.x = position.x;
        this.node.y = position.y;
    },


    setRankLow () {
        this.rankable.setRank(rankLow);
    },


    setRankNormal () {
        this.rankable.setRank(this.rankNormal);
    },


    die () {
        this.deactivateEnemy();
        this.scheduleOnce(() => {
            this.moveToInitialPosition();
            this.currentDirection = this.initialDirection;
            this.activateEnemy();
        }, globalStorage.scene.delayAfterEnemyDie);
    },


    activateEnemy (value) {
        value = value ?? true;
        this.alive = value;
        let collider = this.getComponent(cc.Collider);
        collider.enabled = value;
    },


    deactivateEnemy (value) {
        this.activateEnemy(false);
    },


    updateAnimation () {
        let direction = this.currentDirection;
        let alive = this.alive;
        this.enemyBody.active = alive;
        this.enemyEyesDown.active  = alive && direction === Directions.SOUTH;
        this.enemyEyesUp.active    = alive && direction === Directions.NORTH;
        this.enemyEyesRight.active = alive && direction === Directions.EAST;        
        this.enemyEyesLeft.active  = alive && direction === Directions.WEST;

        if (this.currentShaderStatus !== this.requeredShaderStatus) {
            this.currentShaderStatus = this.requeredShaderStatus;
            let blueActiveValue = this.currentShaderStatus === EnemyShaderStatus.NORMAL ? 0 : 1;
            for (let material of this.enemyMaterials) {
                material.setProperty('blueActive', blueActiveValue);
                material.setProperty('alpha', 1.0);
            }

            this.blinkAnimation?.stop();
            this.blinkDelayFunction && this.unschedule(this.blinkDelayFunction);
            if (this.currentShaderStatus === EnemyShaderStatus.HARMLESS_1 ||
                this.currentShaderStatus === EnemyShaderStatus.HARMLESS_2) {
                this.blinkAnimation = this.createBlinkAnimation();
                this.blinkDelayFunction = () => this.blinkAnimation.start();
                this.scheduleOnce(() => this.blinkDelayFunction(), 5);
            }
        }
    },


    createBlinkAnimation () {
        if (!this.animation) {
            let shaderProperties = {
                alpha: 1.0
            };
            let setShaderProperty = () => {
              for (let material of this.enemyMaterials) {
                  material.setProperty('alpha', shaderProperties.alpha);
            }};

            this.animation = cc.tween(shaderProperties)
              .repeat(1000, cc.tween()
                .to(0.1, { alpha: 0.2 })
                .call(() => setShaderProperty())
                .delay(1)
                .to(0.1, { alpha: 1.0 })
                .call(() => setShaderProperty())
                .delay(1)
              );
        }

        return this.animation;
    },


    onGamePause () {
        cc.director.getScheduler().pauseTarget(this);
        let bodyAnimation = this.enemyBody.getComponent(cc.Animation);
        bodyAnimation.pause();
    },


    onGameResume () {
        cc.director.getScheduler().resumeTarget(this);
        let bodyAnimation = this.enemyBody.getComponent(cc.Animation);
        bodyAnimation.resume();
    }
});
