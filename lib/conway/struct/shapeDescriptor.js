class ShapeDescriptor {

    constructor (w, h) {
        this.width = w;
        this.height = h;
    }

    subdividableBy (N) {
        return this.width % N == 0 && this.height % N == 0;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        ShapeDescriptor: ShapeDescriptor
    }
}