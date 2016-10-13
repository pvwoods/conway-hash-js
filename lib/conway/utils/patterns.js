class MatrixPatterns {

    // @brief 32x32 test pattern for Matrix
    static testPattern01 () {

        var crds = [[],[],[],[]];
        var mtx = [Matrix.eye(16),Matrix.eye(16),Matrix.eye(16),Matrix.eye(16)]
        
        for(var i = 0; i < 16 * 16; i++) {
            var squareTest = i < 16 || i > 240 || i % 16 == 0 || i % 16 == 15;
            crds[0].push([i % 16, Math.floor(i/16), squareTest ? 1:0]);
            crds[1].push([i % 16, Math.floor(i/16), i % 3 == 0 ? 1:0]);
            crds[2].push([i % 16, Math.floor(i/16), Math.floor(i / 16) % 2 == 0 ? 1:0]);
            crds[3].push([i % 16, Math.floor(i/16), 1]);
        }
        
        mtx.map((x, i) => x.batchSetCoords(crds[i]));

        var top = mtx[0].concat(mtx[1]);
        var bot = mtx[2].concat(mtx[3]);
        
        return top.transposedConcat(bot);
    }

    static gosperGun () {

        var gridSize = 64;

        var aliveCells = [
            [1,5,1],[1,6,1],[2,5,1],[2,6,1],[11,5,1],[11,6,1],[11,7,1],[12,4,1],[12,8,1],
            [13,3,1],[13,9,1],[14,3,1],[14,9,1],[15,6,1],[16,4,1],[16,8,1],[17,5,1],[17,6,1],
            [17,7,1],[18,6,1],[21,3,1],[21,4,1],[21,5,1],[22,3,1],[22,4,1],[22,5,1],[23,2,1],
            [23,6,1],[25,1,1],[25,2,1],[25,6,1],[25,7,1],[35,3,1],[35,4,1],[36,3,1],[36,4,1],
            [35,22,1],[35,23,1],[35,25,1],[36,22,1],[36,23,1],[36,25,1],[36,26,1],[36,27,1],
            [37,28,1],[38,22,1],[38,23,1],[38,25,1],[38,26,1],[38,27,1],[39,23,1],[39,25,1],
            [40,23,1],[40,25,1],[41,24,1]
        ];
        
        return new SparseMatrix(64, 64, aliveCells);
    }

    static surprisinglyTinyBigSparseMatrix () {
        var rawPoints = [
            [0,0,1],
            [7,0,2],
            [7,7,3],
            [0,7,4]
        ]

        var points = rawPoints.map(x => [new BigInt(x[0].toString()), new BigInt(x[1].toString()), x[2]]);

        return new BigSparseMatrix(new BigInt("8"), new BigInt("8"), points);
    }

}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        MatrixPatterns: MatrixPatterns
    }
}