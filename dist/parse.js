'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.parseArgsAndConfigFileObj = function (args, configFileObj) {

    var config = {
        'default': JSON.parse(configFileObj),
        'user': null
    };
    config.user = _underscore2.default.clone(config.default, true);

    return config;
};

module.exports.parseInputFileObj = function (inputFileObj, config) {

    var data = [];
    var inputStr = inputFileObj.toString();

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = inputStr.split('\n')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var line = _step.value;


            if (line.match('#') || line === '') {
                continue;
            }

            var item = line.split('\t');
            data.push({
                'name': item[0],
                'value': parseFloat(item[1]),
                'values': _underscore2.default.map(item.slice(2), function (i) {
                    return parseFloat(i);
                })
            });
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