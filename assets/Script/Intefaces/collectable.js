
cc.Class({
    extends: cc.Component,

    properties: {
        points: 0
    },

    ctor () {
        this.delegate = undefined;
    },


    getPoints () {
        return this.points;
    },


    collect () {
        return this.delegate.collect(); 
    },


    getInfluence () {
        return this.delegate.getInfluence();
    }
});
