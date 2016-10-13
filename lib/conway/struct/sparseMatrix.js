/**
 * Sparse Matrices are specifically for storing
 * a Matrix that contains mostly 0's.  It stores
 * a row sorted dictionary of coords that map to a list
 * of columns that are non-zero. For method level descriptions,
 * see matrix.js
 */
class SparseMatrix extends Matrix {

    constructor (width, height, coords) {
        super();
        this.width = width;
        this.height = height;
        this.coords = coords;
        this.coordsByRow = {}
        for(var i = 0; i < coords.length; i++) {
            if(this.coordsByRow[coords[i][1]] == undefined) this.coordsByRow[coords[i][1]] = [];
            this.coordsByRow[coords[i][1]].push(coords[i]);
        }
    }

    get matrix () {
        var m = new ZeroMatrix(this.width, this.height);
        return m.matrixForm.batchSetCoords(this.coords).matrix;
    }

    get matrixForm() {
        return new Matrix(this.matrix);
    }

    setCoord (x, y, v) {
        var c = this.coords.slice().push([x, y, v]);
        return new SparseMatrix(this.width, this.height, c);
    }

    get nonZeroCoords () {
        return this.coords
    }

    batchSetCoords (coords) {
        return new SparseMatrix(this.width, this.height, _.flatten([this.coords, coords]));
    }

    T () {
        var coords = this.coords.map(x => [x[1], x[0], x[2]]);
        return new SparseMatrix(this.height, this.width, coords);
    }

    flip () {
        return this.matrixForm.flip();
    }

    flatten () {
        return new SparseMatrix(this.width * this.height, height, this.coords.map(x => [(x[1] * this.width) + x[0], 0, x[2]]));
    }

    sub (x1, y1, x2, y2) {
        var coords = []
        for(var cy = y1; cy <= y2; cy++) {
            if(this.coordsByRow[cy]) {
                for(var cx = 0; cx < this.coordsByRow[cy].length; cx++) {
                    var candidate = this.coordsByRow[cy][cx][0];
                    if(candidate >= x1 && candidate <= x2) coords.push(this.coordsByRow[cy][cx].slice());
                }
            }
        }
        return new SparseMatrix((x2-x1)+1, (y2-y1)+1, coords.map(x => [x[0] - x1, x[1] - y1, x[2]]));
    }

    reshape(width, height) {
        return this.matrixForm.reshape(this.width, this.height);
    }

    shape () {
        return new ShapeDescriptor(this.width, this.height);
    }

    concat (concatee) {
        if(this.height != concatee.height) throw new Error("concatee and target matrices must have same height to concat");
        var concatCoords = concatee.nonZeroCoords.map(x => [x[0] + this.width, x[1], x[2]])
        return new SparseMatrix(this.width + concatee.width, this.height, _.flatten([this.coords, concatCoords]));
    }

    transposedConcat (concatee) {
        if(this.width != concatee.width) throw new Error("concatee and target matrices must have same height to concat");
        var concatCoords = concatee.nonZeroCoords.map(x => [x[0], x[1] + this.height, x[2]])
        return new SparseMatrix(this.width, this.height + concatee.height, _.flatten([this.coords, concatCoords]));
    }

    get isEmpty () {
        return this.coords.length == 0;
    }

    toString() {
        return this.matrixForm.toString();
    }

}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        SparseMatrix: SparseMatrix
    }
}