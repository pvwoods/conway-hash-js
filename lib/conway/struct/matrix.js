/**
 * NOTE: A Matrix should be treated as immutable.  Do not edit `_matrix` directly, but
 * instead use setCoord(x, y, v), which returns a new matrix.
 */
class Matrix {

    static eye (size) {
        var result = [];
        for(var i = 0; i < size; i++) {
            var rowResult = [];
            for(var j = 0; j < size; j++) {
                rowResult.push(i == j ? 1:0);
            }
            result.push(rowResult);
        }
        return new Matrix(result);
    }

    constructor(m) {
        this._matrix = m;
    }

    get matrix () {
        return this._matrix;
    }

    setCoord (x, y, v) {
        var m = this.matrix.slice();
        m[y][x] = v;
        return new Matrix(m);
    }

    // @brief returns a list of x,y tuples for any non zero bits
    get nonZeroCoords () {
        return this.matrix.reduce((py, y, yi) => {
            y.reduce((px, x, xi) => {
                if(x != 0) px.push([xi, yi]);
                return px;
            }, py);
            return py;
        }, []);
    }

    // @brief takes an array of tuples of form (x, y, v) and sets the matrix at coord x,y to value v
    batchSetCoords (coords) {
        var m = this.matrix.slice();
        for(var i = 0; i < coords.length; i++) m[coords[i][1]][coords[i][0]] = coords[i][2];
        return new Matrix(m);
    }

    // @brief returns a transposed copy of the current matrix
    T () {
        if(this.shape().width > 0) {
            return new Matrix(this.matrix[0].map((col, i) => this.matrix.map((row) => row[i])))
        }
        return new Matrix([])
    }

    // reverses matrix by row
    flip () {
        return new Matrix(this.matrix.map(x => x.reverse()));
    }


    // @brief takes an NxM matrix and returns (N*M)x1 matrix in row,col order
    flatten () {
        return new Matrix([[].concat.apply([], this.matrix)]);
    }

    // @brief returns a new.  Assumes that x1,y1 are always less than x2,y2
    sub (x1, y1, x2, y2) {

        if(x1 < 0 || y1 < 0) throw new Error("X1,Y1 must be positive");
        if(x1 > x2 || y1 > y2) throw new Error("X1,Y1 must be smaller than X2,Y2");

        var mShape = this.shape();
        var max_x2 = x2 < mShape.width ? x2:mShape.width-1;
        var max_y2 = y2 < mShape.height ? y2:mShape.height-1;

        var result = []

        for(var row = y1; row <= max_y2; row++) {
            var rowResult = [];
            for(var col = x1; col <= max_x2; col++) {
                rowResult.push(this.matrix[row][col]);
            }
            result.push(rowResult);
        }

        return new Matrix(result);
    }

    // @brief reshapes the target matrix into a matrix with a shape of width,height
    reshape(width, height) {
        var elements = this.flatten().matrix[0];
        if(width * height != elements.length) {
            throw new Error("You must reshape to a size that conforms to the number of elements");
        }
        var counter = 0;
        var result = [];
        var rowResult = [];
        while(counter < elements.length) {
            if(counter != 0 && counter % width == 0) {
                result.push(rowResult);
                rowResult = [];
            }
            rowResult.push(elements[counter]);
            counter++;
        }
        result.push(rowResult);

        return new Matrix(result);
    }

    // @brief current shape of matrix (in terms of width and height)
    shape () {
        if(this._shape != undefined) return this._shape;
        if(this.matrix.length > 0) {
            var wdth = this.matrix[0].length;
            this._shape = new ShapeDescriptor(wdth == undefined ? 1:wdth, this.matrix.length);
        } else {
            this._shape = new ShapeDescriptor(0,0);
        }
        return this._shape;
    }

    // @brief concatenates a matrix (concatee) to the left of this.matrix
    concat (concatee) {
        if(this.shape().width != concatee.shape().width) {
            throw new Error("concatenated matrices must have the same height, got " + this.shape().width + " and " + concatee.shape().width);
        }
        var result = _.zip([this.matrix, concatee.matrix]).map(x => {  
            if(Array.isArray(x[0])) {
                return x[0].concat(x[1]);
            }else {
                return x;
            }
        });
        
        return new Matrix(result);
    }

    // @brief An optimized form of `topMatrix.T().concat(botMatrix.T()).T()`
    // which is a way to use a leftwise concat for upward/downward concatenation
    transposedConcat (concatee) {
        return new Matrix(concatee.matrix.reduce((p, x) => { 
            p.push(x.slice()); 
            return p; 
        }, this.matrix));
    }

    // @brief returns whether all elements are 0
    get isEmpty () {
        
        if(this._isEmpty != undefined) return this._isEmpty;

        for(var row = 0; row < this.shape().width; row++) {
            for(var col = 0; col < this.matrix[row].length; col++) {
                if(this.matrix[row][col] == 1) {
                    this._isEmpty = false;
                    return this._isEmpty;
                }
            }
        }
        this._isEmpty = true;
        return this._isEmpty;

    }

    // @brief readable representation of the matrix
    toString() {
        
        var result = this.matrix.reduce((str, row) => {
            return str + "[ " + row.join(" ") + " ]\n\t";
        }, "[\n\t");
        
        return result.substring(0, result.length - 1) + "]";
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        Matrix: Matrix
    }
}