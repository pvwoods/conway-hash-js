class UpdatableCanvas {

    constructor (container, id, width, height) {
        this._container = container;
        this._canvas = document.createElement('canvas');
        this._canvas.id = id;
        this._canvas.width = width;
        this._canvas.height = height;

        this._context = this._canvas.getContext('2d');
        this._context.imageSmoothingEnabled = false;

        this._container.appendChild(this._canvas);
    }

    setPixelBlack (x, y) {
        var id = this._context.createImageData(1,1);
        id.data[0] = 0;
        id.data[1] = 0;
        id.data[2] = 0;
        id.data[3] = 255;
        this._context.putImageData(id, x, y);
    }

    batchSetPixelBlack (sets) {
        var id = this._context.createImageData(this._canvas.width, this._canvas.height);
        for(var i = 0; i < sets.length; i++) {
            var offset = ((sets[i][1] * this._canvas.width) + sets[i][0]) * 4;
            id.data[offset] = 0;
            id.data[offset + 1] = 0;
            id.data[offset + 2] = 0;
            id.data[offset + 3] = 255;
        }
        this._context.putImageData(id, 0, 0);
    }

}