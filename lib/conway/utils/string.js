class StringUtils {

    // @brief implementation of java's hashcode.
    static hash(target) {
        if(target.length == 0) return (0).toString(36);
        var result = 0, char;
        for(var i = 0; i < target.length; i++) {
            char = target.charCodeAt(i);
            result = ((result << 5) - result) + char;
            result |= 0;
        }
        return result.toString();
    }

}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        StringUtils: StringUtils
    }
}