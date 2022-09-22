
cc.Class({
    extends: cc.Component,

    properties: {
        points: 0,
    },


    acceptDamage (value) {
        this.delegate?.acceptDamage?.call(this.delegate, value);
    },


    die () {
        this.delegate?.die?.call(this.delegate);
    },


    getPoints () {
        return this.points;
    }
});
