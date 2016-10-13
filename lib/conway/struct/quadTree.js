class QuadTree {

    createFromQuads(ul, ur, bl, br) {
        
        var canonicalHash = StringUtils.hash(ul.hash + ur.hash + bl.hash + br.hash);
        
        if(QuadTree.__DISABLE_CACHING == undefined && QuadTree._NODE_CACHE[canonicalHash]) {
            return QuadTree._NODE_CACHE[canonicalHash];
        } else {

            var tree = new QuadTree();
            
            tree.upperLeft = ul;
            tree.upperRight = ur;
            tree.bottomLeft = bl;
            tree.bottomRight = br;
            tree.leafNode = false;
            tree.quadSize = ul.quadSize * 2;
            tree.level = ul.level + 1;
            tree.population = ul.population + ur.population + bl.population + br.population;

            QuadTree._NODE_CACHE[tree.hash] = tree;

            return tree;

        }
    }

    mergeNodesCentered(ul, ur, bl, br) {
        return this.createFromQuads(
            ul.bottomRight,
            ur.bottomLeft,
            bl.upperRight,
            br.upperLeft
        )
    }

    // @brief returns the center subnode of two horizontally merged nodes 
    mergeNodesHorizontally(left, right) {
        return this.createFromQuads(
            left.upperRight, 
            right.upperLeft, 
            left.bottomRight,
            right.bottomLeft
        );
    }

    // @brief returns the center subnode of two vertically merged nodes 
    mergeNodesVertically(upper, lower) {
        return this.createFromQuads(
            upper.bottomLeft, 
            upper.bottomRight, 
            lower.upperLeft,
            lower.upperRight
        );
    }

    makeQuadTree(matrix) {
        return new QuadTree(matrix);
    }

    static zeroQuad(size, level) {
        return new QuadTree(new ZeroMatrix(size, size), level);
    }


    constructor (matrix = null) {

        if(matrix == undefined || matrix == null) return;
        
        var mShape = matrix.shape();
        this.leafNode = false;
        this.quadSize = mShape.width / 2;
        
        if(mShape.subdividableBy(4) || mShape.width == 2) {
                
            // sub-divide into 4 quadrants.
            this.upperLeft = new QuadTree(matrix.sub(0,0,this.quadSize-1,this.quadSize-1));
            this.bottomLeft = new QuadTree(matrix.sub(0,this.quadSize,this.quadSize-1,(this.quadSize*2)-1));
            this.upperRight = new QuadTree(matrix.sub(this.quadSize,0,(this.quadSize*2)-1,this.quadSize-1));
            this.bottomRight = new QuadTree(matrix.sub(this.quadSize,this.quadSize,(this.quadSize*2)-1,(this.quadSize*2)-1));
            this.population = this.upperLeft.population + this.upperRight.population + this.bottomLeft.population + this.bottomRight.population;
            this.level = this.upperLeft.level + 1;

        } else if(mShape.width == 1) {
            
            this.leafNode = true;
            this.population = matrix.matrix[0][0];
            this.level = 0;

        } else {
            throw new Error("matrix must be sub-dividable into 4 quadrants to build a QuadTree");
        }

        QuadTree._NODE_CACHE[this.hash] = this;

    }

    get shape() {
        if(this.leafNode) return ShapeDescriptor(1,1);
        return new ShapeDescriptor(this.quadSize * 2, this.quadSize * 2);
    }

    // @brief recursively traverses the tree collecting coords for any non zero cells in the matrix
    aliveCoords (x_offset = 0, y_offset = 0) {
        if(this.leafNode == true) {
            return this.population == 1 ? [[x_offset, y_offset]]:[];
        } else {
            if(this.population == 0) return []
            var quads = [
                this.upperLeft.aliveCoords(x_offset, y_offset),
                this.upperRight.aliveCoords(x_offset + this.quadSize, y_offset),
                this.bottomLeft.aliveCoords(x_offset, y_offset + this.quadSize),
                this.bottomRight.aliveCoords(x_offset + this.quadSize, y_offset + this.quadSize)
            ];
            return _.flatten(quads);
        }
    }

    // @brief if the population of all subnodes is 0, the whole tree from this node is empty
    get isEmpty() {
        return this.population == 0;
    }

    // @brief returns a quadtree with this node in the center
    expand() {
        var zeroQuad = QuadTree.zeroQuad(this.quadSize);
        var ul = this.createFromQuads(zeroQuad, zeroQuad, zeroQuad, this.upperLeft);
        var ur = this.createFromQuads(zeroQuad, zeroQuad, this.upperRight, zeroQuad);
        var bl = this.createFromQuads(zeroQuad, this.bottomLeft, zeroQuad, zeroQuad);
        var br = this.createFromQuads(this.bottomRight, zeroQuad, zeroQuad, zeroQuad);
        return this.createFromQuads(ul, ur, bl, br);
    }

    // @brief return the a centered subnode of the current node
    centeredSubNode () {
        return this.createFromQuads(
            this.upperLeft.bottomRight,
            this.upperRight.bottomLeft,
            this.bottomLeft.upperRight,
            this.bottomRight.upperLeft
        );
    }

    // @brief calculates the next interval in the conway series.
    nextInterval () {

        // don't bother checking if it's empty
        if(this.population == 0) return this.upperLeft;
        // return the nextInterval cache if it exists
        if(this._nextInterval) return this._nextInterval;
        
        if(this.level <= 1) throw new Error("nextInerval should not recurse beyond the 3rd to last level");
        if(this.level == 2) return this.calculateNextInterval();
        
        // generate nine offset sub-quadrants and calculate their nextInterval

        var upLeft = this.upperLeft.nextInterval();
        var upCenter = this.mergeNodesHorizontally(this.upperLeft, this.upperRight).nextInterval();

        var upRight = this.upperRight.nextInterval();
        var centerLeft = this.mergeNodesVertically(this.upperLeft, this.bottomLeft).nextInterval();

        var center = this.centeredSubNode().nextInterval();
        var centerRight = this.mergeNodesVertically(this.upperRight, this.bottomRight).nextInterval();

        var bottomLeft = this.bottomLeft.nextInterval();
        var bottomCenter = this.mergeNodesHorizontally(this.bottomLeft, this.bottomRight).nextInterval();

        var bottomRight = this.bottomRight.nextInterval();

        // merge the sub quadrants into full quadrants and take the centers
        var fullUpperLeft = this.mergeNodesCentered(upLeft, upCenter, centerLeft, center);
        var fullUpperRight = this.mergeNodesCentered(upCenter, upRight, center, centerRight);
        var fullBottomLeft = this.mergeNodesCentered(centerLeft, center, bottomLeft, bottomCenter);
        var fullBottomRight = this.mergeNodesCentered(center, centerRight, bottomCenter, bottomRight);

        // merge our final quadrants
        this._nextInterval = this.createFromQuads(fullUpperLeft, fullUpperRight, fullBottomLeft, fullBottomRight);

        return this._nextInterval;

    }

    // @brief for any node of level K-3 that isn't cached, we need to calculate the next step
    calculateNextInterval () {

        if(this.level != 2) throw new Error("claculateNextInterval should only be invoked on the K-3 level");

        var countUpperLeft = (
            this.upperLeft.sumThree(3) + 
            this.upperRight.sumLeft() + 
            this.bottomLeft.sumUpper() + 
            this.bottomRight.upperLeft.population
        );
        var countUpperRight = (
            this.upperRight.sumThree(2) + 
            this.upperLeft.sumRight() + 
            this.bottomRight.sumUpper() + 
            this.bottomLeft.upperRight.population
        );
        var countBottomLeft = (
            this.bottomLeft.sumThree(1) + 
            this.bottomRight.sumLeft() +
            this.upperLeft.sumBottom() + 
            this.upperRight.bottomLeft.population
        );
        var countBottomRight = (
            this.bottomRight.sumThree(0) +
            this.bottomLeft.sumRight() + 
            this.upperRight.sumBottom() + 
            this.upperLeft.bottomRight.population
        );
        
        var upperLeftBit = (countUpperLeft == 3 || (countUpperLeft == 2 && this.upperLeft.bottomRight.population == 1));
        var upperRightBit = (countUpperRight == 3 || (countUpperRight == 2 && this.upperRight.bottomLeft.population == 1));
        var bottomLeftBit = (countBottomLeft == 3 || (countBottomLeft == 2 && this.bottomLeft.upperRight.population == 1));
        var bottomRightBit = (countBottomRight == 3 || (countBottomRight == 2 && this.bottomRight.upperLeft.population == 1));

        var matrix = new Matrix([
            [
                upperLeftBit ? 1:0,
                upperRightBit ? 1:0
            ],
            [
                bottomLeftBit ? 1:0,
                bottomRightBit ? 1:0
            ]
        ]);

        return this.makeQuadTree(matrix);
    }

    // summation helpers
    sumThree (skipIndex) {
        var values = [this.upperLeft.population, this.upperRight.population, this.bottomLeft.population, this.bottomRight.population];
        return values.reduce((x, y) => x + y, 0) - values[skipIndex]; 
    }

    sumLeft () {
        return this.upperLeft.population + this.bottomLeft.population;
    }

    sumRight () {
        return this.upperRight.population + this.bottomRight.population;
    }

    sumBottom () {
        return this.bottomLeft.population + this.bottomRight.population;
    }

    sumUpper () {
        return this.upperLeft.population + this.upperRight.population;
    }

    // @brief Generates a canonical hash for this node. Any nodes that
    // have the same configuration of bits, will have the same hash.
    get hash () {
        if(this._hash == undefined) {
            if(this.leafNode) {
                this._hash = StringUtils.hash(this.population.toString());
            } else {
                this._hash = StringUtils.hash(this.upperLeft.hash + this.upperRight.hash + this.bottomLeft.hash + this.bottomRight.hash);
            }
        }
        return this._hash;
    }

    toString () {
        return this.matrixForm().toString();
    }

    // @brief  rebuilds matrix used to create QuadTree
    matrixForm () {
        if(this.leafNode) {
            return new Matrix(this.highlight == undefined ? [this.population]:["*"])
        } else {
            var top = this.upperLeft.matrixForm().concat(this.upperRight.matrixForm());
            var bot = this.bottomLeft.matrixForm().concat(this.bottomRight.matrixForm());
            return top.transposedConcat(bot);
        }
    }

    // @brief provides a string representation of the tree.  Useful for debugging.
    treeRepresentation (realLevel=0) {

        var s = "";
        var spaces = realLevel.toString() + " (" + this.level + "): " + new Array(realLevel + 1).join("  ");

        if(this.leafNode != true) {
            s += spaces + "+ ul" + (this.upperLeft ? ("\n" + this.upperLeft.treeRepresentation(realLevel + 1)):": UNDEFINED\n");
            s += spaces + "+ ur" + (this.upperRight ? ("\n" + this.upperRight.treeRepresentation(realLevel + 1)):": UNDEFINED\n");
            s += spaces + "+ bl" + (this.bottomLeft ? ("\n" + this.bottomLeft.treeRepresentation(realLevel + 1)):": UNDEFINED\n");
            s += spaces + "+ br" + (this.bottomRight ? ("\n" + this.bottomRight.treeRepresentation(realLevel + 1)):": UNDEFINED\n");
        } else {
            s += spaces + "> " + this.population.toString() + "\n";
        }

        return s;

    }

    // @brief returns tree representation with hash codes.  Useful for debugging.
    hashTreeRepresentation (realLevel=0) {
        var s = "";
        var spaces = realLevel.toString() + " (" + this.level + "): " + new Array(realLevel + 1).join("  ");

        if(this.leafNode != true) {
            s += spaces + "+ ul [" + (this.upperLeft ? this.upperLeft.hash:"#") + "] " + 
                (this.upperLeft ? ("\n" + this.upperLeft.hashTreeRepresentation(realLevel + 1)):": UNDEFINED\n");

            s += spaces + "+ ur [" + (this.upperRight ? this.upperRight.hash:"#") + "] " + 
                (this.upperRight ? ("\n" + this.upperRight.hashTreeRepresentation(realLevel + 1)):": UNDEFINED\n");

            s += spaces + "+ bl [" + (this.bottomLeft ? this.bottomLeft.hash:"#") + "] " + 
                (this.bottomLeft ? ("\n" + this.bottomLeft.hashTreeRepresentation(realLevel + 1)):": UNDEFINED\n");

            s += spaces + "+ br [" + (this.bottomRight ? this.bottomRight.hash:"#") + "] " + 
                (this.bottomRight ? ("\n" + this.bottomRight.hashTreeRepresentation(realLevel + 1)):": UNDEFINED\n");
        } else {
            s += spaces + "> [" + this.hash + "]\n";
        }

        return s;
    }
}

/* 
 * class level variable for storing canonical nodes.
 * This way, we can reuse a canoncial version of "[[0]]", 
 * "[[0,0],[1,0]]", etc. for all occourences of said node.
 */
QuadTree._NODE_CACHE = {};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        QuadTree: QuadTree
    }
}