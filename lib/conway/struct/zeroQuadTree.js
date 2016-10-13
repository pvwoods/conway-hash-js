class ZeroQuadTree {

    constructor (size) {

        var hash = StringUtils.hash(size.toString());
        if(ZeroQuadTree._NODE_CACHE[hash]) return ZeroQuadTree._NODE_CACHE[hash];
        this.leafNode = size.isAbsOne;
        this.quadSize = size.divide(BigInt.TWO);
        this.population = 0;
        this.halfQuadSize = this.quadSize.divide(BigInt.TWO);
        if(this.leafNode) {
            this._level = 0;
        }

        ZeroQuadTree._NODE_CACHE[hash] = this;

    }

    get level () {
        if(this._level == undefined){
            this._level = 0;
            var g = new BigInt(this.quadSize.toString());
            while(!g.isAbsOne) {
                g = g.divide(BigInt.TWO);
                this._level++;
            }
        }
        return this._level;
    }

    matrixForm () {
        return new BigSparseMatrix(this.quadSize, this.quadSize, []);
    }

    get upperLeft () {
        return new ZeroQuadTree(this.halfQuadSize);
    }

    get upperRight () {
        return new ZeroQuadTree(this.halfQuadSize);
    }

    get bottomLeft () {
        return new ZeroQuadTree(this.halfQuadSize);
    }

    get bottomRight () {
        return new ZeroQuadTree(this.halfQuadSize);
    }

    get shape() {
        if(this.leafNode) return new BigShapeDescriptor(1,1);
        return new BigShapeDescriptor(this.quadSize * 2, this.quadSize * 2);
    }

    // @brief recursively traverses the tree collecting coords for any non zero cells in the matrix
    aliveCoords (x_offset = 0, y_offset = 0) {
        return [];
    }

    // @brief if the population of all subnodes is 0, the whole tree from this node is empty
    get isEmpty() {
        return true;
    }

    // @brief returns a quadtree with this node in the center
    expand() {
        return new ZeroQuadTree(this.quadSize.multiply(BigInt.TWO));
    }

    // @brief return the a centered subnode of the current node
    centeredSubNode () {
        return new ZeroQuadTree(this.halfQuadSize, this.level - 1);
    }

    // @brief calculates the next interval in the conway series.
    nextInterval () {
        return new ZeroQuadTree(this.halfQuadSize, this.level - 1);
    }

    calculateNextInterval () {
        return new ZeroQuadTree(this.halfQuadSize, this.level - 1);
    }

    // summation helpers
    sumThree (skipIndex) {
        return 0;
    }

    sumLeft () {
        return 0;
    }

    sumRight () {
        return 0;
    }

    sumBottom () {
        return 0;
    }

    sumUpper () {
        return 0;
    }

    // @brief Generates a canonical hash for this node. Any nodes that
    // have the same configuration of bits, will have the same hash.
    get hash () {
        if(this._hash == undefined) {
            StringUtils.hash(this.quadSize.toString());
        }
        return this._hash;
    }
}

ZeroQuadTree._NODE_CACHE = {};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        ZeroQuadTree: ZeroQuadTree
    }
}