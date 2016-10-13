class BigShapeDescriptor {

    constructor (w, h) {
        this.width = w;
        this.height = h;
    }

    subdividableBy (N) {
        return this.width.smallModulo(N) == 0 && this.height.smallModulo(N) == 0;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        BigShapeDescriptor: BigShapeDescriptor
    }
}