class _ {
    static zip (rows) {
        return rows[0].map((_,c) => {
            return rows.map(row => row[c]);
        });
    }

    static group (arr, N) {
        if(arr.length % N != 0) throw new Error("Array must be divisble by N to group");
        var result = [];
        var tuple = [];
        var counter = 0;
        while(counter < arr.length) {
            if(counter != 0 && counter % N == 0) {
                result.push(tuple);
                tuple = [];
            }
            tuple.push(arr[counter]);
            counter++;
        }
        result.push(tuple);
        return result;

    }

    static flatten(arr) {
        return [].concat.apply([], arr);
    }

}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        _: _
    }
}