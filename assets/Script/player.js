const Directions = require('directions');
const GlobalStorage = require('global-storage');
const GlobalEventSystem = require('global-event-system');
const Score = require('score');
const FightArena = require('fight-arena');

let globalStorage = GlobalStorage.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();
let score = Score.getInstance();

const rankHigh = 1000;

cc.Class({
    extends: cc.Component,


    ctor () {
        this.roadNetworkGraph = undefined;
        this.currentDirection = undefined;
        this.newDirection = undefined;
        this.currentRoadId = undefined;
        this.initialDirection = Directions.NONE;
        this.initialPosition = undefined;
        this.rankNormal = 0;
        this.superPowerEnergizerTimer = undefined;
        this.movementEnabled = false;
    },


    onLoad () {
        this.currentDirection =
        this.newDirection = this.initialDirection;
        this.roadNetworkGraph = globalStorage.scene.roadNetworkGraph;

        [
            'portable',
            'damageable',
            'rankable',
            'scorable'
        ].forEach(intfName => {
            let intf = this.getComponent(intfName);
            intf.delegate = this;
            this[intfName] = intf;
        });

        this.rankNormal = this.rankable.getRank();
        this.scorable.lives = globalStorage.scene.playerLivesCountMax;

        this.initialPosition = this.findInitialPosition();
        if (this.initialPosition) {
            this.movePlayerToInitialPosition();
        }
        else {
            cc.warn("FAILED to set start position of player");
        }

        this.onControlPanelButtonDown = this.onControlPanelButtonDown.bind(this);
    },


    findInitialPosition () {
        return this.roadNetworkGraph.findNearestPositionOnRoad(this.node);
    },


    movePlayerToInitialPosition () {
        this.currentRoadId = this.initialPosition.roadId;
        this.node.x = this.initialPosition.x;
        this.node.y = this.initialPosition.y;
    },


    onEnable () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this); 
        globalEventSystem.subscribe('control-panel-button-down', this.onControlPanelButtonDown);       
    },


    onDisable () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        globalEventSystem.unsubscribe('control-panel-button-down', this.onControlPanelButtonDown);
    },


    start () {
        this.notifyPlayerStarted();
        this.movementEnabled = true;
    },


    update (dt) {
        this.movementEnabled && this.updatePosition(dt);
    },


    updatePosition (dt) {
        let distance = dt * this.getSpeed();

        let isDirectionAvalable = function(roadId, direction) {
            let road = this.roadNetworkGraph.roads.refById[roadId];
            return !(road.isOneWay() && road.direction !== direction);
        }.bind(this);

        if ((this.currentDirection === Directions.NONE ||
            this.newDirection     === Directions.NONE ||
            Directions.isReverse(this.currentDirection, this.newDirection)) &&
            isDirectionAvalable(this.currentRoadId, this.newDirection)) {
            this.currentDirection = this.newDirection;
        }

        if (this.currentDirection == Directions.NONE) {
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
                    if (this.roadNetworkGraph.hasRoadTowardsDirection(nextCrossroad, this.newDirection)) {
                        this.currentDirection = this.newDirection;
                    }
                    if (this.roadNetworkGraph.hasRoadTowardsDirection(nextCrossroad, this.currentDirection)) {
                        this.currentRoadId = nextCrossroad.getRoadIdTowardsDirection(this.currentDirection);
                        calculateNextPosition();
                    }
                }
            }
        }.bind(this);

        calculateNextPosition();

        this.node.x = currentPosition.x;
        this.node.y = currentPosition.y;
    },


    onKeyDown (event) {
        let direction;

        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:  
                direction = Directions.WEST;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                direction = Directions.EAST;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                direction = Directions.NORTH;
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:    
                direction = Directions.SOUTH;
                break;
        }

        if (direction !== undefined) {
            this.changeDirection(direction);
        }
    },


    onControlPanelButtonDown (event, buttonName) {
        let direction = {
            left: Directions.WEST,
            right: Directions.EAST,
            top: Directions.NORTH,
            bottom: Directions.SOUTH
        }[buttonName];

        if (direction !== undefined) {
            this.newDirection = direction;
        }
    },


    changeDirection (direction) {
        this.newDirection = direction;
    },


    onCollisionEnter (otherGameObject, selfGameObject) {
        let self = this;

        let checkWin = function () {
            if (score.gemsCount == globalStorage.scene.numberOfGems) {
                self.win();        
            }
        };

        let collideWithFightable = function () {
            let arena = new FightArena();
            arena.fight(selfGameObject, otherGameObject);
        };        

        let collideWithCollectable = function (collectable) {
            let gotGem = function () {
                self.scorable.incGems();
                return true;
            };

            let gotLifeEnergizer = function () { 
                let result = self.scorable.lives < globalStorage.scene.playerLivesCountMax;
                if (result) {
                    self.scorable.lives++;
                }
                return result;
            };            

            let gotHarmlessEnemiesEnergizer = function () {
                globalEventSystem.publish('enemies-harmless');
                return true;
            };


            let infuenceList = collectable.getInfluence();
            let collect = false;
            infuenceList.forEach(influence => {
                switch (influence) {
                    case 'gem':
                        collect |= gotGem();
                        break;
                    case 'life-energizer':
                        collect |= gotLifeEnergizer();
                        break;    
                    case 'harmless-enemies-energizer':
                        collect |= gotHarmlessEnemiesEnergizer();
                        break;  
                }
            });


            if (collect) {
                let points = collectable.getPoints();
                self.scorable.addPoints(points);
                self.scoreChanged();
                collectable.collect();
                checkWin();
            }
        };

        let fightable = otherGameObject.getComponent('fightable');
        fightable && collideWithFightable(fightable);

        let collectable = otherGameObject.getComponent('collectable');
        collectable && collideWithCollectable(collectable);
    },


    scoreChanged () {
        let scorable = this.scorable;
        score.points = scorable.points;
        score.gemsCount = scorable.gems;
        score.playerLivesCount = scorable.lives;
        score.killedCount = scorable.killed;
    },


    getSpeed () {
        return globalStorage.scene.speed;
    },


    forceMove (roadId, direction, position) {        
        this.currentRoadId = roadId;
        if (this.currentDirection == this.newDirection) {
            this.newDirection = direction;
        }
        this.currentDirection = direction;
        this.node.x = position.x;
        this.node.y = position.y;
    },


    acceptDamage (value) {
    },


    die (value) {
        if (this.isImmortal()) {
            return;
        }

        this.notifyPlayerStopped();
        this.node.active = false;
        if (this.scorable.lives) {
            this.scorable.decLives();
            this.scoreChanged();
            this.scheduleOnce(() => {
                this.movePlayerToInitialPosition();
                this.currentDirection =
                this.newDirection = this.initialDirection;
                this.node.active = true;
                this.movementEnabled = true;
                this.notifyPlayerStarted();
            }, globalStorage.scene.delayAfterPlayerDie);
        }
        else {
            this.lose();
        }
    },


    setRankNormal () {        
        this.rankable.setRank(this.rankNormal);
    },


    setRankHigh () {
        this.rankable.setRank(rankHigh);
    },


    isImmortal () {
        return globalStorage.scene.playerImmortal;
    },


    notifyPlayerStarted () {
        globalEventSystem.publish('player-started');
    },


    notifyPlayerStopped () {
        globalEventSystem.publish("player-stopped");
    },


    win() {
        this.notifyPlayerStopped();
        this.movementEnabled = false;
        globalEventSystem.publish('win');
    },


    lose () {
        globalEventSystem.publish('lose');
    },
});
