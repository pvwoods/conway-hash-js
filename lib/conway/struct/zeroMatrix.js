class ZeroMatrix extends Matrix {

    constructor (width, height) {
        super();
        this.width = width;
        this.height = height;
    }

    get matrix () {
        var array = [], row = [];
        var w = this.width, h = this.height;
        while (w--) row.push(0);
        while (h--) array.push(row.slice());
        return array;
    }

    get matrixForm() {
        return new Matrix(this.matrix);
    }

    setCoord (x, y, v) {
        if ( v == 0 ) return this;
        var m = this.matrix;
        return m.setCoord(x, y, v);
    }

    get nonZeroCoords () {
        return [];
    }

    batchSetCoords (coords) {
        var m = this.matrixForm;
        return m.batchSetCoords(coords);
    }

    T () {
        return this;
    }

    flip () {
        return this;
    }

    flatten () {
        return new ZeroMatrix(this.width * this.height, 1);
    }

    sub (x1, y1, x2, y2) {
        return new ZeroMatrix((x2-x1)+1,(y2-y1)+1);
    }

    reshape(width, height) {
        if(width * height != this.width * this.height) {
            throw new Error("You must reshape to a size that conforms to the number of elements");
        }
        return new ZeroMatrix(width, height);
    }

    shape () {
        return new ShapeDescriptor(this.width, this.height);
    }

    concat (concatee) {
        if(concatee._isEmpty != undefined && concatee._isEmpty == true) {
            var mShape = concatee.shape();
            return new ZeroMatrix(this.width + mShape.width, this.height);
        }
        return this.matrixForm.concat(concatee);
    }

    transposedConcat (concatee) {
        if(concatee._isEmpty != undefined && concatee._isEmpty == true) {
            var mShape = concatee.shape();
            return new ZeroMatrix(this.width, this.height + mShape.height);
        }
        return this.matrixForm.transposedConcat(concatee);
    }

    get isEmpty () {
        return this._isEmpty;
    }

    toString() {
        return this.matrixForm.toString();
    }

}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        ZeroMatrix: ZeroMatrix
    }
}