'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// return list including all nodes
module.exports.get_nodes = function (d) {
    var nodes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];


    nodes.push(d);

    _underscore2.default.each(d.children || d._children, function (i) {
        module.exports.get_nodes(i, nodes);
    });

    return nodes;
};

module.exports.init_nodes = function (nodes, config) {

    _underscore2.default.each(nodes, function (i) {
        i.value = 0;
        i.values = [];
        i.keys = [];

        if (!config.functree.show_all_nodes) {

            // うまくいかない
            if (i.name.match(/M\d{5}|EPM\d{4}|Undefined MODULE/)) {

                i._children = i.children;
                i.children = null;
            }
        }
    });
};

module.exports.set_values = function (nodes, data, config) {

    _underscore2.default.each(data, function (i) {
        var match = _underscore2.default.find(nodes, function (j) {
            return i['name'] === j['name'];
        });
        _underscore2.default.extend(match, i);
    });
};