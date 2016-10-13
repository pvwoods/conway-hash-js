// simple helper class to package engine functionality
class ConwayEngine {

    constructor (tree) {
        this.quadTree = tree;
    }

    // @brief step forwad in the game by one interval
    step () {
        this.quadTree = this.quadTree.expand().nextInterval();
    }

    // @brief step forward in the game by N intervals
    stepBy(N) {
        while(N--) this.quadTree = this.quadTree.expand().nextInterval();
    }

    // @brief get all alive coords
    aliveCoords () {
        return this.quadTree.aliveCoords();
    }

}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        ConwayEngine: ConwayEngine
    }
}