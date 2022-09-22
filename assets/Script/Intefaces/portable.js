
cc.Class({
    extends: cc.Component,
    

    move (roadId, direction, position) {
        this.delegate?.forceMove?.call(this.delegate, roadId, direction, position);
    }
});
