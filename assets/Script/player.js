const Directions = require('directions');
const GlobalStorage = require('global-storage');
const GlobalEventSystem = require('global-event-system');
const Score = require('score');
const FightArena = require('fight-arena');

let globalStorage = GlobalStorage.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();
let score = Score.getInstance();

const rankHigh = 1000;

const animationClipNames = {
    MOVE: 'Pacman Move',
    DIE: 'Pacman Death'
};

const PlayerStatus = {
    ALIVE: 1,
    DYING: 2,
    DEAD:  3
};


cc.Class({
    extends: cc.Component,


    ctor () {
        this.roadNetworkGraph = undefined;
        this.newDirection = undefined;
        this.initialData = {
            direction: Directions.NONE,
            position: undefined,
            scaleX: undefined,
            scaleY: undefined
        };
        this.currentData = {
            roadId: undefined,
            direction: undefined,
            distance: 0,            
        };        
        this.rankNormal = 0;
        this.superPowerEnergizerTimer = undefined;
        this.playerStatus = PlayerStatus.ALIVE;
        this.movementEnabled = false;
        this.animation = undefined;
    },


    onLoad () {
        this.currentData.direction =
        this.newDirection = this.initialData.direction;
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

        this.initialData.scaleX = this.node.scaleX;
        this.initialData.scaleY = this.node.scaleY;
        this.initialData.position = this.findInitialPosition();
        if (this.initialData.position) {
            this.movePlayerToInitialPosition();
        }
        else {
            cc.warn("FAILED to set start position of player");
        }

        this.onControlPanelButtonDown = this.onControlPanelButtonDown.bind(this);
       
        this.animation = this.getComponent(cc.Animation);        
    },


    findInitialPosition () {
        return this.roadNetworkGraph.findNearestPositionOnRoad(this.node);
    },


    movePlayerToInitialPosition () {
        this.currentData.roadId = this.initialData.position.roadId;
        this.node.x = this.initialData.position.x;
        this.node.y = this.initialData.position.y;
        this.node.scaleX = this.initialData.scaleX;
        this.node.scaleY = this.initialData.scaleY;
        this.node.angle = 0;
        this.node.opacity = 255;
    },


    onEnable () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this); 
        globalEventSystem.subscribe('control-panel-button-down', this.onControlPanelButtonDown);       
        this.animation.on('lastframe', this.onAnimationLastFrame, this);
    },


    onDisable () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        globalEventSystem.unsubscribe('control-panel-button-down', this.onControlPanelButtonDown);
        this.animation.off('lastframe', this.onAnimationLastFrame, this);
    },


    start () {
        this.notifyPlayerStarted();
        this.movementEnabled = true;
    },


    update (dt) {
        let prevPosition = this.node.position;

        (this.playerStatus === PlayerStatus.ALIVE) && this.movementEnabled && this.updatePosition(dt);

        this.currentData.distance = Math.abs(this.node.x - prevPosition.x) +
                                    Math.abs(this.node.y - prevPosition.y);

        this.updateAnimation();
    },


    updatePosition (dt) {
        let speed = globalStorage.scene.speed;
        let distance = dt * speed;

        let isDirectionAvalable = function(roadId, direction) {
            let road = this.roadNetworkGraph.roads.refById[roadId];

            if (road.isOneWay())
                return road.direction === direction;

            switch (direction) {
                case Directions.EAST:
                case Directions.WEST:
                    return road.hasHorizontalOrientation();
                case Directions.NORTH:
                case Directions.SOUTH:
                    return road.hasVerticalOrientation();
                default:
                    return true;
            }
        }.bind(this);

        if ((this.currentData.direction === Directions.NONE ||
             this.newDirection     === Directions.NONE ||
             Directions.isReverse(this.currentData.direction, this.newDirection)) &&
            isDirectionAvalable(this.currentData.roadId, this.newDirection)) {
            this.currentData.direction = this.newDirection;
        }

        if (this.currentData.direction == Directions.NONE) {
            return;
        }


        let currentPosition = {
            x: this.node.x,
            y: this.node.y
        };

        let calculateNextPosition = function () {
            let nextCrossroad = this.roadNetworkGraph.getNextCrossroad(
                currentPosition,
                this.currentData.direction,
                this.currentData.roadId
            );
            if (nextCrossroad) {
                let road = this.roadNetworkGraph.roads.refById[this.currentData.roadId];
                let coord1Name = road.getCoord1Name();
                let distanceToCrossroad = Math.abs(nextCrossroad[coord1Name] - this.node[coord1Name]);
                if (distanceToCrossroad > distance) {
                    switch (this.currentData.direction) {
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
                        this.currentData.direction = this.newDirection;
                    }
                    if (this.roadNetworkGraph.hasRoadTowardsDirection(nextCrossroad, this.currentData.direction)) {
                        this.currentData.roadId = nextCrossroad.getRoadIdTowardsDirection(this.currentData.direction);
                        calculateNextPosition();
                    }
                }
            }
        }.bind(this);

        calculateNextPosition();

        this.node.x = currentPosition.x;
        this.node.y = currentPosition.y;
        this.node.angle = Directions.getRotation(this.currentData.direction) ?? this.node.angle;
        this.node.scaleX = Directions.getScale(this.currentData.direction) ?? this.node.scaleX;
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


    forceMove (roadId, direction, position) {        
        this.currentData.roadId = roadId;
        if (this.currentData.direction == this.newDirection) {
            this.newDirection = direction;
        }
        this.currentData.direction = direction;
        this.node.x = position.x;
        this.node.y = position.y;
    },


    acceptDamage (value) {
    },


    die () {
        if (this.isImmortal()) {
            return;
        }

        this.playerStatus = PlayerStatus.DYING;
        this.notifyPlayerStopped();
        if (this.scorable.lives) {
            this.scorable.decLives();
            this.scoreChanged();
            this.scheduleOnce(() => {                
                this.movePlayerToInitialPosition();
                this.currentData.direction =
                this.newDirection = this.initialData.direction;
                this.node.active = true;
                this.movementEnabled = true;
                this.playerStatus = PlayerStatus.ALIVE;
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


    updateAnimation () {
        switch(this.playerStatus) {
            case PlayerStatus.ALIVE: {
                let moveClipState = this.animation.getAnimationState(animationClipNames.MOVE);

                if (!moveClipState.isPlaying) {
                    this.animation.play(animationClipNames.MOVE);        
                }
                else {
                    if (this.currentData.distance > 0) 
                        moveClipState.isPaused && this.animation.resume(animationClipNames.MOVE);
                    else 
                        !moveClipState.isPaused && this.animation.pause(animationClipNames.MOVE);
                }
                break;
            }

            case PlayerStatus.DYING: {
                let dieClipState = this.animation.getAnimationState(animationClipNames.DIE);

                if (!dieClipState.isPlaying)    
                    this.animation.play(animationClipNames.DIE);
                break;
            }
        }
    },


    onAnimationLastFrame (animationEvent, animationState) {
        switch(animationState.name) {
            case animationClipNames.DIE:
                this.playerStatus = PlayerStatus.DEAD;
                this.animation.stop(animationClipNames.DIE);
                this.node.opacity = 0;                
        }
    }
});
