require('./config.inc.js');
genOutput = function(type, code, msg, data) {
    var output;
    output = {
        'status': {
            'type': type,
            'code': code,
            'message': msg
        }
    };
    if (data) {
        for (var attributename in data) {
            if (typeof(data[attributename]) == 'object' && (data[attributename] != null)) {
                for (var key in data[attributename]) {
                    if (Array.isArray(data[attributename][key])) {
                        continue;
                    }
                    if (typeof(data[attributename][key]) == 'object' && (data[attributename][key] != null)) {
                        for (var key2 in data[attributename][key]) {
                            if (Array.isArray(data[attributename][key][key2])) {
                                continue;
                            }
                            if (data[attributename][key][key2] != null) {
                                data[attributename][key][key2] = (data[attributename][key][key2]).toString();
                            }
                        }
                    } else {
                        if (data[attributename][key] != null) {
                            data[attributename][key] = (data[attributename][key]).toString();
                        }
                    }
                }
            } else {
                if (data[attributename] != null) {
                    data[attributename] = (data[attributename]).toString();
                } else {
                    data[attributename] = {};
                }
            }
        }
        for (var key in data) {
            output[key] = data[key];
        }
    }
    return output;
}
is_valid_integer_input = function(i) {
    if (typeof(i) == "undefined" || isNaN(parseInt(i)) || i == "") {
        return false;
    } else {
        return true;
    }
}