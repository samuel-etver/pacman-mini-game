
const audioManagerNodeName = 'Audio Manager';


cc.Class({
    extends: cc.Component,

    properties: {
        backgroundMusic: {
            default: null,
            type: cc.AudioClip
        }
    },


    onLoad () {
        let audioManagerNode = cc.find(audioManagerNodeName);

        let setBackgroundClip = () => {
            let backgroundMusicComponent = audioManagerNode.getComponent('background-music');
            backgroundMusicComponent.clip = this.backgroundMusic;
        };


        if (!audioManagerNode) {
            cc.resources.load('Prefab/' + audioManagerNodeName, (err, prefab) => {
                audioManagerNode = cc.instantiate(prefab);
                setBackgroundClip();
                cc.game.addPersistRootNode(audioManagerNode);
            }); 
        }
        else {
            setBackgroundClip();
        }
    },
});
