
cc.Class({
    extends: cc.Component,

    properties: {
        rank: 0
    },


    getRank () {
        return this.rank;
    },


    setRank (value) {
        this.rank = value;
    }
});
