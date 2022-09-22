cc.Class({
    extends: cc.Component,

    properties: {
        points: 0,
        killed: 0,
        gems: 0,
        lives: 0,
    },


    addPoints (value) {
        this.points += value;
    },


    incKilled () {
        this.killed++;
    },


    incGems() {
        this.gems++;
    },


    incLives () {
        this.lives++;
    },


    decLives () {
        this.lives--;
    },


    scoreChanged () {
        this.delegate?.scoreChanged?.call(this.delegate);
    }
});
