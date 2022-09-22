class FightArena {
    fight (character1, character2) {
        let rank1 = character1.getComponent('rankable').getRank();
        let rank2 = character2.getComponent('rankable').getRank();

        let kill = function (winner, looser) {
            let looserPoints = 0;
            let looserDead = false;
            let looserDamageable = looser.getComponent('damageable');
            if (looserDamageable) {
                looserPoints = looserDamageable.getPoints();
                looserDead = true;
                looserDamageable.die();
            }
            let winnerScorable = winner.getComponent('scorable');
            if (winnerScorable) {
                winnerScorable.addPoints(looserPoints);
                looserDead && winnerScorable.incKilled();
                winnerScorable.scoreChanged();
            }
        };

        if (rank1 > rank2) {
            kill(character1, character2);
        } else if (rank1 < rank2) {
            kill(character2, character1);
        }
    }
};


export default FightArena;
