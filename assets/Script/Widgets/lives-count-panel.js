const Score = require('score');
const GlobalEventSystem = require('global-event-system');

let score = Score.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();

const lifeName = 'Life';

cc.Class({
    extends: cc.Component,

    ctor () {
        this.lifeModel = undefined;
        this.lifeGap = undefined;
    },


    onLoad () {
        let lives = this.node.children.filter(child => child.name == lifeName);        
        this.lifeModel = lives[0];
        this.lifeGap = lives[1].x - lives[0].x;

        this.updateContents();        
        this.onLivesCountChanged = this.onLivesCountChanged.bind(this);
    },


    onEnable () {
        globalEventSystem.subscribe('player-lives-count-changed', this.onLivesCountChanged);
    },


    onDisable () {
        globalEventSystem.unsubscribe('player-lives-count-changed', this.onLivesCountChanged);
    },


    onLivesCountChanged () {
        this.updateContents();
    },


    updateContents () {
        let getLives = () => {
            return this.node.children.filter(child => child.name === lifeName);
        };

        let livesCount = Math.max(score.playerLivesCount ?? 0, 0);
        let lives = getLives();

        for (let i = lives.length; i < livesCount; i++) {
            let newLife = cc.instantiate(this.lifeModel);
            this.node.addChild(newLife);
            newLife.x += i * this.lifeGap;            
        }

        lives = getLives();

        for (let i = 0; i < lives.length; i++) {
            lives[i].active = i < livesCount;
        }
    }
});
