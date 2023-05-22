var newId = 1;


cc.Class({
    extends: cc.Component,    

    properties: {
        gemsEnabled: true,
    }, 


    ctor () {
        this._id = newId++;
        this.orientation = undefined;
    },

    
    getId () {
        return this._id;
    },
});
