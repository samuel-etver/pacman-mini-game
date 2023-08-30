
cc.Class({
    extends: cc.Component,

    properties: {
        delay: 0.5
    },


    start () {
        this.node.scale = 0.1;
        cc.tween(this.node)
        .delay(this.delay)
        .to(0.4, {scale: 2})
        .to(0.4, {scale: 1})
        .repeat( 5, cc.tween()
                      .to(0.2, {angle:  5})
                      .to(0.2, {angle: -5}))
        .to(0.5, {angle: 0})            
        .start();
    },
});
