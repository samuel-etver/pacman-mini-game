cc.Class({
    extends: cc.Component,

    properties: {
        visibleOnStart: false
    },

    onLoad () {
        this.node.children.forEach(child => {
            if (child.getComponent('portal-in')) {
                child.getComponent(cc.Sprite).setVisible(this.visibleOnStart);
            }
        });
    },
});
