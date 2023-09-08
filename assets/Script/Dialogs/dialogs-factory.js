const GlobalStorage = require('global-storage');
const GlobalEventSystem = require('global-event-system');

let globalStorage = GlobalStorage.getInstance();
let globalEventSystem = GlobalEventSystem.getInstance();

let instance;

class DialogsFactory {
    execute (scene, dialogName) {
        let loadBackground = function (prefab) {
            globalStorage.scene.pauseActivated = true;
            globalEventSystem.publish('pause-activated');
            let background = cc.instantiate(prefab);
            scene.addChild(background);
            background.width = scene.width;
            background.height = scene.height;
            background.opacity = 192;
        };

        let loadDialog = function (prefab) {
            let dialog = cc.instantiate(prefab);
            scene.addChild(dialog);
            dialog.opacity = 0;
            dialog.scale = 0.2;
            cc.tween(dialog)
                .to(0.5,
                    {
                        scale: 1,
                        opacity: 230
                    },
                    {
                        easing: 'quartInOut'
                    })
                .start();
        };

        cc.resources.load('Prefab/Dialog Background Panel', (err, prefab) => {
            this.pauseGame (scene);
            loadBackground(prefab);
            cc.resources.load('Prefab/' + dialogName, (err, prefab) => loadDialog(prefab));
        });
    }


    free (dialog, callback) {       
        cc.tween (dialog)
            .to(0.5,
                {
                    scale: 0.2,
                    opacity: 0
                },
                {
                    easing: 'quartInOut'
                })
            .call(() => {
                callback?.call();
                dialog.destroy();
                let scene = dialog.parent;
                let background = scene.getChildByName('Dialog Background Panel');
                background.destroy();
                this.resumeGame(scene);
                globalStorage.scene.pauseActivated = false;
                globalEventSystem.publish('pause-deactivated');
            })    
            .start();  
    }


    pauseGame (scene) {
        let update = function () {          
        };

        let replaceUpdate = function (component) {
            if(component.update) {
                component._savedUpdate = component.update;
                component.update = update;
            }
        };

        this.iterateComponents(scene, replaceUpdate);
    }


    resumeGame (scene) {
        let replaceUpdate = function (component) {
            if(component._savedUpdate) {
                component.update = component._savedUpdate;
            }
        }

        this.iterateComponents(scene, replaceUpdate);
    }


    iterateComponents (node, callback) {
        for (let component of node._components) {                
            callback(component);
        }
        for (let child of node.children) {
            this.iterateComponents(child, callback);
        }
    }
};


export default {
    getInstance () {
        if (!instance) {
            instance = new DialogsFactory();
        }
        return instance;
    },
};
