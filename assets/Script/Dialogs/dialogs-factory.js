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
            scene.node.addChild(background);
            background.width = scene.node.width;
            background.height = scene.node.height;
            background.opacity = 192;
        };

        let loadDialog = function (prefab) {
            let dialog = cc.instantiate(prefab);
            scene.node.addChild(dialog);
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
                let background = dialog.parent.getChildByName('Dialog Background Panel');
                background.destroy();
                globalStorage.scene.pauseActivated = false;
                globalEventSystem.publish('pause-deactivated');
            })    
            .start();  
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
