'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.read = function (fpath) {

    try {
        var fd = _fs2.default.readFileSync(fpath);
        var str = fd.toString();

        return str;
    } catch (e) {
        _process2.default.stderr.write('File I/O Error: "' + fpath + '"\n');
        _process2.default.exit(1);
    }
};

module.exports.write = function (fpath, str) {

    try {
        var fd = _fs2.default.openSync(fpath, 'w');
        _fs2.default.writeSync(fd, str);
    } catch (e) {
        _process2.default.stderr.write('File I/O Error: "' + fpath + '"\n');
        _process2.default.exit(1);
    }
};

module.exports.load_ref = module.exports.load_config = function (fpath) {

    try {
        var str = module.exports.read(fpath);
        var data = JSON.parse(str);

        return data;
    } catch (e) {
        _process2.default.stderr.write('Invalid JSON Error: "' + fpath + '"\n');
        _process2.default.exit(1);
    }
};

module.exports.read_input = function (fpath, config) {

    var str = module.exports.read(fpath);
    var data = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = str.split('\n')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var line = _step.value;


            if (line.match('#') || line === '') {
                continue;
            }

            try {
                var item = line.split('\t');
                var d = {
                    'name': item[0],
                    'value': config.functree.use_1stcol_as_radius ? parseFloat(item[1]) : 0.0,
                    'values': _underscore2.default.map(item.slice(config.functree.use_1stcol_as_radius ? 2 : 1), function (i) {
                        return parseFloat(i);
                    })
                };

                data.push(d);
            } catch (e) {
                // うまくcatchしない?
                _process2.default.stderr.write('Unexpeceted input type: skipped');
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return data;
};