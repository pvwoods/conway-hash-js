/**
 * This is a very simple driver program for calculating Conway Games to the N'th interval
 */
_ = require("./lib/conway/utils/func.js")._;
StringUtils = require("./lib/conway/utils/string.js").StringUtils;
BigInt = require("./lib/conway/struct/bigint.js").BigInt;
ShapeDescriptor = require("./lib/conway/struct/shapeDescriptor.js").ShapeDescriptor;
BigShapeDescriptor = require("./lib/conway/struct/bigShapeDescriptor.js").BigShapeDescriptor;
Matrix = require("./lib/conway/struct/matrix.js").Matrix;
ZeroMatrix = require("./lib/conway/struct/zeroMatrix.js").ZeroMatrix;
SparseMatrix = require("./lib/conway/struct/sparseMatrix.js").SparseMatrix;
BigSparseMatrix = require("./lib/conway/struct/BigSparseMatrix.js").BigSparseMatrix;
QuadTree = require("./lib/conway/struct/quadTree.js").QuadTree;
BigQuadTree = require("./lib/conway/struct/bigQuadTree.js").BigQuadTree;
ZeroQuadTree = require("./lib/conway/struct/zeroQuadTree.js").ZeroQuadTree;
MatrixPatterns = require("./lib/conway/utils/patterns.js").MatrixPatterns;
ConwayEngine = require("./lib/conwayEngine.js").ConwayEngine;

if (process.argv.length < 4) {
  console.log('Usage: node ' + process.argv[1] + ' <filename> <intervals>');
  process.exit(1);
}

var fs = require('fs');
var filename = process.argv[2];

fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  //parse into JSON array of ints
  var processedString = "[[" + data.substring(1,data.length-1).replace(/[\s\t]*(?:\r\n|\r|\n)[\s\t]/g, "").replace(/\)\(/g, "],[") + "]]";
  // since numbers may be larger than int_max, treat as strings
  processedString = processedString.replace(/(\-?\d\d*)/g, '"$1"');
  // parse processedString as JSON array, then map to cast tuples to BigInt
  var liveCells = JSON.parse(processedString);
  
  var min_x = BigInt.ZERO, min_y = BigInt.ZERO;
  var max_x = BigInt.ZERO, max_y = BigInt.ZERO;

  // cast all live cells to BigInt and find min/max
  liveCells = liveCells.map(c => {
    var x = new BigInt(c[0]);
    var y = new BigInt(c[1]);
    if(x.lt(min_x)) min_x = x;
    if(y.lt(min_y)) min_y = y;
    if(x.gt(max_x)) max_x = x;
    if(y.gt(max_y)) max_y = y;
    return [x, y, 1]
  });

  var gosperCells = MatrixPatterns.gosperGun().nonZeroCoords.map(x => {
        if(x[1] < 20) return [new BigInt(x[0].toString()), new BigInt(x[1].toString()), 1];
    }).filter(x => x != undefined);

  min_x = min_x.abs();
  min_y = min_y.abs();
  
  // normalize all coords to (0,0)
  liveCells = liveCells.map(c => [c[0].add(min_x), c[1].add(min_y), 1]);

  // matrix size needs to be a power of two to work with QuadTree
  var matrix_width = BigInt.powTwoGreaterThan(min_x.add(max_x));
  var matrix_height = BigInt.powTwoGreaterThan(min_y.add(max_y));

  var cellMatrix = new BigSparseMatrix(matrix_width, matrix_height, gosperCells);
  var tree = new BigQuadTree(cellMatrix);

  var engine = new ConwayEngine(tree);
  var output = engine.aliveCoords().map(x => "(" + x[0].subtract(min_x) + "," + x[1].subtract(min_y) + ")").join("\n");
  console.log("\n------------------\nStarting configuration\n------------------\n\n" + output);
  engine.stepBy(process.argv[3]);
  var output = engine.aliveCoords().map(x => "(" + x[0].subtract(min_x) + "," + x[1].subtract(min_y) + ")").join("\n");
  console.log("\n------------------\nFinal configuration after " + process.argv[3] + " steps\n------------------\n\n" + output);

  console.log(engine.quadTree.level);
  
});