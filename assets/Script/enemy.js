const GlobalStorage = require('global-storage');
const GlobalEventSystem = require('global-event-system');
const Directions = require('directions');

let globalStorage = GlobalStorage.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();

const enemyBodyNodeName = 'Enemy Body';

const rankLow  = -1000;

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

        this.enemyBodyNode = this.node.getChildByName(enemyBodyNodeName);
        this.collider = this.getComponent(cc.Collider);

        this.node.active = false;
    },


    onDestroy () {
        globalEventSystem.unsubscribe('player-started', this.onPlayerStarted);
        globalEventSystem.unsubscribe('player-stopped', this.onPlayerStopped);
        globalEventSystem.unsubscribe('enemies-harmless', this.onEnemyHarmless);

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
        this.scheduleOnce(this.onEnemyHarmlessTimeout,
          globalStorage.scene.harmlessEnemiesDuration);
    },


    onEnemyHarmlessTimeout () {
        this.setRankNormal();
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

        let calculateNextPosition = function () {
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
                    calculateNextPosition();
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
        }, globalStorage.scene.delayAfterEnemyDie + 3);
    },


    activateEnemy (value) {
        value = value ?? true;
        this.collider.enabled = value;
        this.enemyBodyNode.active = value;
    },


    deactivateEnemy (value) {
        this.activateEnemy(false);
    }
});
