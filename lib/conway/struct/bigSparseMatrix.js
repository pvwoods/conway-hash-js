/**
 * BigSparseMatrix is a SparseMatrix that uses BigInt instead
 * of standard integers.  For method level descriptions,
 * see matrix.js
 */

class BigSparseMatrix extends Matrix {

    constructor (width, height, coords) {
        super();
        this.width = width;
        this.height = height;
        this.coords = coords;
        this.coordsByRow = {}
        this.coordKeyToBigInt = {}
        for(var i = 0; i < coords.length; i++) {
            if(this.coordsByRow[coords[i][1].toString()] == undefined) this.coordsByRow[coords[i][1].toString()] = {};
            this.coordsByRow[coords[i][1].toString()][coords[i][0].toString()] = coords[i];
            this.coordKeyToBigInt[coords[i][0].toString()] = coords[i][0];
            this.coordKeyToBigInt[coords[i][1].toString()] = coords[i][1];
        }
    }

    get matrix () {
        if(this.width.intSafe) {
            var m = new ZeroMatrix(this.width.intForm, this.height.intForm);
            return m.matrixForm.batchSetCoords(this.coords.map((x) => [x[0].intForm, x[1].intForm, x[2]])).matrix;
        } else {
            throw new Error("Matrix casting is only possible for numbers within BigInt.intSafe range");
        }
    }

    get matrixForm() {
        return new Matrix(this.matrix);
    }

    setCoord (x, y, v) {
        var c = this.coords.slice().push([x, y, v]);
        return new BigSparseMatrix(this.width, this.height, c);
    }

    get nonZeroCoords () {
        return this.coords
    }

    batchSetCoords (coords) {
        return new BigSparseMatrix(this.width, this.height, _.flatten([this.coords, coords]));
    }

    T () {
        var coords = this.coords.map(x => [x[1], x[0], x[2]]);
        return new BigSparseMatrix(this.height, this.width, coords);
    }

    flip () {
        return this.matrixForm.flip()
    }

    flatten () {
        return new BigSparseMatrix(this.width.multiply(this.height), 1, this.coords.map(x => [(x[1].multiply(this.width)) + x[0], 0, x[2]]));
    }

    sub (x1, y1, x2, y2) {

        if(this.coords.length == 0) return new BigSparseMatrix(x2.subtract(x1).incr(), y2.subtract(y1).incr(), []);

        var coords = [];
        var rowKeys = Object.keys(this.coordsByRow);
        for(var ri = 0; ri < rowKeys.length; ri++) {
            var rowCandidate = this.coordKeyToBigInt[rowKeys[ri]];
            if(rowCandidate.gte(y1) && rowCandidate.lte(y2)) {
                var colKeys = Object.keys(this.coordsByRow[rowKeys[ri]]);
                for(var ci = 0; ci < colKeys.length; ci++) {
                    var colCandidate = this.coordKeyToBigInt[colKeys[ci]];
                    if(colCandidate.gte(x1) && colCandidate.lte(x2)) {
                        coords.push(this.coordsByRow[rowKeys[ri]][colKeys[ci]])
                    }
                }
            }
        }

        return new BigSparseMatrix(x2.subtract(x1).incr(), y2.subtract(y1).incr(), coords.map(x => [x[0].subtract(x1), x[1].subtract(y1), x[2]]));
    }

    reshape(width, height) {
        return this.matrixForm.reshape(this.width, this.height);
    }

    shape () {
        return new BigShapeDescriptor(this.width, this.height);
    }

    concat (concatee) {
        if(!this.height.equal(concatee.height)) throw new Error("concatee and target matrices must have same height to concat");
        var concatCoords = concatee.nonZeroCoords.map(x => [x[0].add(this.width), x[1], x[2]])
        return new BigSparseMatrix(this.width.add(concatee.width), this.height, _.flatten([this.coords, concatCoords]));
    }

    transposedConcat (concatee) {
        if(!this.width.equal(concatee.width)) throw new Error("concatee and target matrices must have same height to concat");
        var concatCoords = concatee.nonZeroCoords.map(x => [x[0], x[1].add(this.height), x[2]])
        return new BigSparseMatrix(this.width, this.height.add(concatee.height), _.flatten([this.coords, concatCoords]));
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
        BigSparseMatrix: BigSparseMatrix
    }
}