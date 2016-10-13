class BigQuadTree extends QuadTree {

    createFromQuads(ul, ur, bl, br, level, quadSize) {
        
        var canonicalHash = StringUtils.hash(ul.hash + ur.hash + bl.hash + br.hash);
        
        if(BigQuadTree.__DISABLE_CACHING == undefined && BigQuadTree._NODE_CACHE[canonicalHash]) {
            return BigQuadTree._NODE_CACHE[canonicalHash];
        } else {

            var tree = new BigQuadTree();
            
            tree.upperLeft = ul;
            tree.upperRight = ur;
            tree.bottomLeft = bl;
            tree.bottomRight = br;
            var q = [ul.level, ur.level, bl.level, br.level];
            if(!ul.quadSize.equal(ur.quadSize) || !ul.quadSize.equal(bl.quadSize) || !ul.quadSize.equal(br.quadSize)) throw new Error("BACK");
            tree.leafNode = false;
            tree.quadSize = ul.quadSize.multiply(BigInt.TWO);
            tree.level = ul.level + 1;
            tree.population = ul.population + ur.population + bl.population + br.population;

            BigQuadTree._NODE_CACHE[tree.hash] = tree;

            return tree;

        }
    }

    mergeNodesCentered(ul, ur, bl, br) {
        return this.createFromQuads(
            ul.bottomRight,
            ur.bottomLeft,
            bl.upperRight,
            br.upperLeft,
            ul.level,
            ul.quadSize
        )
    }

    // @brief returns the center subnode of two horizontally merged nodes 
    mergeNodesHorizontally(left, right) {
        return this.createFromQuads(
            left.upperRight, 
            right.upperLeft, 
            left.bottomRight,
            right.bottomLeft,
            left.level,
            left.quadSize
        );
    }

    // @brief returns the center subnode of two vertically merged nodes 
    mergeNodesVertically(upper, lower) {
        return this.createFromQuads(
            upper.bottomLeft, 
            upper.bottomRight, 
            lower.upperLeft,
            lower.upperRight,
            upper.level,
            upper.quadSize
        );
    }

    makeQuadTree (matrix) {
        var coords = matrix.nonZeroCoords.map(x => {
            return [new BigInt(x[0].toString()), new BigInt(x[1].toString()), 1]
        });
        var w = new BigInt(matrix.shape().width.toString());
        var h = new BigInt(matrix.shape().height.toString());
        var bigMatrix =  new BigSparseMatrix(w, h, coords);
        return new BigQuadTree(bigMatrix);
    }

    static zeroQuad(size, level) {
        return new ZeroQuadTree(size, level);
    }

    constructor (matrix = null) {

        super();

        if(matrix == undefined || matrix == null) return;

        var mShape = matrix.shape();
        this.leafNode = false;
        this.quadSize = mShape.width.divide(BigInt.TWO);
        
        if(mShape.subdividableBy(BigInt.TWO)) {
            
            // sub-divide into 4 quadrants.

            var endQ1 = this.quadSize.decr();
            var endQ2 = this.quadSize.multiply(BigInt.TWO).decr();

            var ulm = matrix.sub(BigInt.ZERO,BigInt.ZERO,endQ1,endQ1);
            this.upperLeft = ulm.isEmpty ? (new ZeroQuadTree(this.quadSize)):(new BigQuadTree(ulm));

            var blm = matrix.sub(BigInt.ZERO,this.quadSize,endQ1,endQ2);
            this.bottomLeft = blm.isEmpty ? (new ZeroQuadTree(this.quadSize)):(new BigQuadTree(blm));
            
            var urm = matrix.sub(this.quadSize,BigInt.ZERO,endQ2,endQ1)
            this.upperRight = urm.isEmpty ? (new ZeroQuadTree(this.quadSize)):(new BigQuadTree(urm));

            var brm = matrix.sub(this.quadSize,this.quadSize,endQ2,endQ2);
            this.bottomRight = brm.isEmpty ? (new ZeroQuadTree(this.quadSize)):(new BigQuadTree(brm));
            
            this.population = this.upperLeft.population + this.upperRight.population + this.bottomLeft.population + this.bottomRight.population;
            this.level = this.upperLeft.level + 1;

        } else if(mShape.width.equal(BigInt.ONE)) {
            
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
        var size = this.quadSize.multiply(BigInt.TWO);
        return new BigShapeDescriptor(size, size);
    }

    expand() {
        var zeroQuad = new ZeroQuadTree(this.quadSize, this.level - 1);
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

    // @brief recursively traverses the tree collecting coords for any non zero cells in the matrix
    aliveCoords (x_offset = BigInt.ZERO, y_offset = BigInt.ZERO) {

        if(this.leafNode == true) {
            return this.population == 1 ? [[x_offset, y_offset]]:[];
        } else {
            if(this.population == 0) return [];
            var quads = [
                this.upperLeft.aliveCoords(x_offset, y_offset),
                this.upperRight.aliveCoords(x_offset.add(this.quadSize), y_offset),
                this.bottomLeft.aliveCoords(x_offset, y_offset.add(this.quadSize)),
                this.bottomRight.aliveCoords(x_offset.add(this.quadSize), y_offset.add(this.quadSize))
            ];
            return _.flatten(quads);
        }
    }
}

BigQuadTree._NODE_CACHE = {}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        BigQuadTree: BigQuadTree
    }
}