const DialogsFactory = require('dialogs-factory');
const GlobalStorage = require('global-storage');

let dialogsFactory = DialogsFactory.getInstance();
let globalStorage = GlobalStorage.getInstance();

const rowHeight = 50;

cc.Class({
    extends: cc.Component,


    onLoad () {
        let appendLabel = function(prefab, text) {
            let label = cc.instantiate(prefab);
            let labelComponent = label.getComponent(cc.Label);
            labelComponent.string = text;
            this.node.addChild(label);            
            return label;
        }.bind(this);

        let numberLabel = this.node.getChildByName('Number Label');
        let pointsLabel = this.node.getChildByName('Points Label');

        let numberLabelY = numberLabel.y;
        let pointsLabelY = pointsLabel.y;

        let achievementPoints = globalStorage.achievements.points;
        let achievementsLength = achievementPoints ? achievementPoints.length : 0;

        for (let i = 0; i < achievementsLength; i++) {
            let newNumberLabel = appendLabel(numberLabel, `${i + 1}.`.toString());
            newNumberLabel.y = numberLabelY;
            numberLabelY -= rowHeight;

            let newPointsLabel = appendLabel(pointsLabel, achievementPoints[i].toString());
            newPointsLabel.y = pointsLabelY;
            pointsLabelY -= rowHeight;
        }

        numberLabel.destroy();
        pointsLabel.destroy();
    },


    onCloseButtonClick () {
        dialogsFactory.free (this.node);
    }
});
