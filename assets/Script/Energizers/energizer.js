cc.Class({
    extends: cc.Component,
    
    onLoad () {
        let collectable = this.getComponent('collectable');
        collectable.delegate = this;
    },


    collect () {
        this.node.destroy(); 
    },


    getInfluence () {
        return [];
    }
});
