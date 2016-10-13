/**
 * A very simple BigInt implementation for base 10 numbers
 */

class BigInt {

    static get ZERO () {
        if(this._zero == undefined) {
            this._zero = new BigInt("0");
        }
        return this._zero;
    }

    static get ONE () {
        if(this._one == undefined) {
            this._one = new BigInt("1");
        }
        return this._one;
    }

    static get NEG_ONE () {
        if(this._negOne == undefined) {
            this._negOne = new BigInt("-1");
        }
        return this._negOne;
    }

    static get TWO () {
        if(this._two == undefined) {
            this._two = new BigInt("2");
        }
        return this._two;
    }

    static fromArray(array, negative=false) {
        var result = new BigInt();
        result.value = array.slice();
        result._negative = negative;
        return result;
    }

    static powTwoGreaterThan(targetValue) {
        var interval = BigInt.TWO;
        var result = BigInt.ONE;
        while(result.lt(targetValue)) result = result.multiply(interval);
        return result;
    }

    // helper for trimming leading 0's' due to some operations, i.e. multiplication
    static trim (arr) {
        while(arr[arr.length - 1] == 0) arr.pop();
        return arr;
    }

    constructor (value, negative=false) {
        
        if(value == undefined) return;

        this._negative = negative;

        if(value.charAt(0) == "-") {
            this._negative = true;
            value = value.substring(1, value.length);
        }

        this.value = value.split("").map(x => parseInt(x)).reverse();
    }

    get negative () {
        if(this.isZero) return false;
        return this._negative;
    }

    get intNegative () {
        return this.negative ? -1:1;
    }

    add (targetValue) {
        if(this.isZero) return BigInt.fromArray(targetValue.value, targetValue.negative);
        if(targetValue.isZero) return BigInt.fromArray(this.value, negative);

        if (this.negative != targetValue.negative) {
            return this.subtract(BigInt.fromArray(targetValue.value, !targetValue.negative));
        }

        var result = [], negative = false;
        var index = 0;
        var tt, tv, ar, cr = 0;
        while(index < this.value.length || index < targetValue.value.length){
            tt = this.value.length > index ? this.value[index]:0;
            tv = targetValue.value.length > index ? targetValue.value[index]:0;
            ar = tt + tv + cr;
            result.push(ar % 10);
            cr = ar / 10 | 0;
            index++;
        }
        if(cr < 10) {
            result.push(cr);
        } else {
            result.push(cr % 10);
            result.push(cr / 10 | 0);
        }
        return BigInt.fromArray(BigInt.trim(result), this.negative);
        
    }

    subtract (targetValue) {
        if(this.isZero) return BigInt.fromArray(targetValue.value, !targetValue.negative);
        if(targetValue.isZero) return BigInt.fromArray(this.value, this.negative);

        if(this.negative != targetValue.negative) {
            return this.add(BigInt.fromArray(targetValue, !targetValue.negative));
        }

        var a = this, b = targetValue, isNegative = false;

        // if both are negative, we can swap and subtract abs values
        if(this.negative) {
            a = BigInt.fromArray(targetValue.value)
            b = BigInt.fromArray(this.value);
        }

        if(a.equal(b)) return BigInt.ZERO;
        if(b.gt(a)) {
            // we always want a > b
            var t = b;
            b = a;
            a = t;
            isNegative = true;
        }

        // okay, let's actually subtract now
        var av = a.value, bv = b.value;
        var diff = new Array(av.length);
	    var borrow = 0;
	    var i;
	    var digit;

        for (i = 0; i < bv.length; i++) {
            digit = av[i] - borrow - bv[i];
            borrow = digit < 0 ? 1:0;
            digit = digit < 0 ? (10+digit):digit;
            diff[i] = digit;
        }
        for (i = bv.length; i < av.length; i++) {
            digit = av[i] - borrow;
            if (digit < 0) {
                digit = 10 + digit;
            } else {
                diff[i++] = digit;
                break;
            }
            diff[i] = digit;
        }
        for ( ; i < av.length; i++) diff[i] = av[i];

        return BigInt.fromArray(BigInt.trim(diff), isNegative);

    }

    multiply (targetValue) {
        if(this.isZero || targetValue.isZero) return BigInt.ZERO;
        if(this.isAbsOne && this.negative) return BigInt.fromArray(targetValue.value, !targetValue.negative);
        if(targetValue.isAbsOne && targetValue.negative) return BigInt.fromArray(this.value, !this.negative);

        var r = (this.value.length >= targetValue.value.length);
        var av = r ? this.value:targetValue.value;
        var bv = r ? targetValue.value:this.value;

        var pl = av.length + bv.length;
        var partial = new Array(pl).fill(0);
        var i;

        for (i = 0; i < bv.length; i++) {
            var carry = 0, bi = bv[i], jm = av.length + i;
            var digit;
            for (var j = i; j < jm; j++) {
                digit = partial[j] + bi * av[j - i] + carry;
                carry = (digit / 10) | 0;
                partial[j] = (digit % 10) | 0;
            }
            if (carry) {
                digit = partial[j] + carry;
                carry = (digit / 10) | 0;
                partial[j] = digit % 10;
            }
        }
        var isNegative = (this.intNegative * targetValue.intNegative) < 0;
        return BigInt.fromArray(BigInt.trim(partial), isNegative);

    }

    multiplyByPositiveSingleDigit (N) {
        
        if(N < 0) throw new Error("N must be positive when calling multiplyByPositiveSingleDigit.  Got " + N);

        if (N == 0 || this.isZero) return ZERO;
        if (N == 1) return this;

        var digit;
        if (this.value.length == 1) {
            digit = this.value[0] * N;
            if (digit >= 10) {
                var result = BigInt.trim([(digit % 10) | 0, (digit / 10) | 0]);
                return BigInt.fromArray(result, this.negative);
            }
            return BigInt.fromArray(BigInt.trim([digit]), this.negative);
        }

        if (N == 2) return this.add(this);
        if (this.isAbsOne) return BigInt.fromArray([N], this.negative);

        var partial = new Array(this.value.length + 1).fill(0);
        var carry = 0;
        for (var j = 0; j < this.value.length; j++) {
            digit = N * this.value[j] + carry;
            carry = (digit / 10) | 0;
            partial[j] = (digit % 10) | 0;
        }
        if (carry) partial[j] = carry;

        return BigInt.fromArray(BigInt.trim(partial), this.negative);
    }

    divide (targetValue) {
        return this.__divideParts(targetValue)[0];
    }

    modulo (targetValue) {
        return this.__divideParts(targetValue)[1];
    }

    __divideParts (targetValue) {
        if (targetValue.isZero) throw new Error("Division by zero");
        if (this.isZero) return [BigInt.ZERO, BigInt.ZERO];

        // if they are equal, return 1
        if(this.abs().equal(targetValue.abs())) {
            return [(this.negative == targetValue.negative ? BigInt.ONE:BigInt.NEG_ONE), BigInt.ZERO];
        }

        if(targetValue.value.length == 1) {
            return this.__dividePartsBySingleDigit(targetValue.value[0])
        }

        // if target value is bigger than this, return 0
        if(targetValue.abs().gt(this.abs())) {
            return [BigInt.ZERO, this];
        }

        var a = targetValue.abs();
        var tvi = this.value.length;
        var digits = targetValue.value.length;
        var quot = [];
        var guess;
        var part = BigInt.fromArray([]);

        while (tvi) {
            tvi--;
            part.value.unshift(this.value[tvi]);
            part = BigInt.fromArray(part.value, part.negative);

            if (part.abs().lt(targetValue)) {
                quot.push(0);
                continue;
            }
            if (part.isZero) {
                guess = 0;
            } else {
                var hx = (part.value[part.value.length - 1] * 10) + part.value[part.value.length - 2];
                var hy = (a.value[a.value.length - 1] * 10) + a.value[a.value.length - 2];
                if (part.value.length > a.value.length)  hx = (hx + 1) * 10;
            }
            do {
                var check = a.multiplyByPositiveSingleDigit(guess);
                if (check.abs().lte(part.abs())){
                    break;
                } 
                guess--;
            } while (guess);

            quot.push(guess);
            if (!guess) continue;
            var diff = part.subtract(check);
            part.value = diff.value.slice();
        }

        var isNegative = (this.intNegative * targetValue.intNegative) < 0;
        return [BigInt.fromArray(BigInt.trim(quot.reverse()), isNegative), BigInt.fromArray(BigInt.trim(part.value), this.negative)];
    }

    __dividePartsBySingleDigit (n) {

        if(n == 0) throw new Error("division by zero");
        if (this.isZero) return [BigInt.ZERO, BigInt.ZERO];

        var digitSign = n < 0 ? -1 : 1;
	    var isNegative = (this.intNegative * digitSign) < 0;
        n = Math.abs(n);

        if (n == 1) return [BigInt.fromArray(this.value, isNegative), BigInt.ZERO];

        if (this.value.length === 1) {
            var q = new BigInt(((this.value[0] / n) | 0).toString());
            var r = new BigInt(((this.value[0] / n) | 0).toString());
            if (isNegative) q._negative = true;
            if (this.negative) r._negative = true;
            return [q, r];
        }

        var digits = this.value.slice();
        var quot = new Array(digits.length);
        var part = 0;
        var diff = 0;
        var i = 0;
        var guess;

        while (digits.length) {
            part = part * 10 + digits[digits.length - 1];
            if (part < n) {
                quot[i++] = 0;
                digits.pop();
                diff = 10 * diff + part;
                continue;
            }
            if (part == 0) {
                guess = 0;
            } else {
                guess = (part / n) | 0;
            }

            var check = n * guess;
            diff = part - check;
            quot[i++] = guess;
            if (!guess) {
                digits.pop();
                continue;
            }

            digits.pop();
            part = diff;
        }

        return [BigInt.fromArray(BigInt.trim(quot.reverse()), isNegative), BigInt.fromArray(BigInt.trim([diff]), this.negative)];



    }

    // @brief modulo for any number less than 10 
    smallModulo (N) {
        return this.value[0] % N;
    }

    abs () {
        return BigInt.fromArray(this.value);
    }

    equal (targetValue) {
        if(this.negative != targetValue.negative) return false;
        if(this.value.length != targetValue.value.length) return false;
        var index = 0;
        while(index < this.value.length) {
            if(this.value[index] != targetValue.value[index]) return false;
            index++;
        }
        return true;
    }

    // greater than operator
    gt (targetValue) {
        if(targetValue.negative && !this.negative) return true;
        if(this.negative && !targetValue.negative) return false;
        if(this.value.length != targetValue.value.length) {
            if(this.negative) {
                return this.value.length < targetValue.value.length;
            } else {
                return this.value.length > targetValue.value.length;
            }
        }
        var index = this.value.length;
        while(index) {
            index--;
            if(this.value[index] != targetValue.value[index]) {
                if(this.negative) {
                    return this.value[index] < targetValue.value[index];
                } else {
                    return this.value[index] > targetValue.value[index];
                }
            }
        }
        return false;
    }

    gte (targetValue) {
        return this.gt(targetValue) || this.equal(targetValue);
    }

    lt (targetValue) {
        return !this.equal(targetValue) && !this.gt(targetValue);
    }

    lte (targetValue) {
        return this.lt(targetValue) || this.equal(targetValue);
    }

    incr () {
        return this.add(BigInt.ONE);
    }

    decr () {
        return this.subtract(BigInt.ONE);
    }

    get intSafe() {
        return this.lt(new BigInt(Number.MAX_SAFE_INTEGER.toString()));
    }

    get intForm () {
        return parseInt(this.toString());
    }

    get isZero() {
        if(this._isZero == undefined) this._isZero = this.value.length == 0 || (this.value.length == 1 && this.value[0] == 0);
        return this._isZero;
    }

    get isAbsOne() {
        if(this._isAbsOne == undefined) this._isAbsOne = this.value.length == 1 && this.value[0] == 1;
        return this._isAbsOne;
    }

    toString() {
        return (this.negative ? "-":"") + this.value.slice().reverse().map(x => x.toString()).join("");
    }

}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        BigInt: BigInt
    }
}