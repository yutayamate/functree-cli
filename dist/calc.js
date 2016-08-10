'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// return array obj including all nodes
var getAllNodes = function getAllNodes(d) {
    var nodes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];


    nodes.push(d);

    _underscore2.default.each(d.children || d._children, function (i) {
        getAllNodes(i, nodes);
    });

    return nodes;
};

module.exports.initTree = function (tree, config) {

    var all = getAllNodes(tree);

    _underscore2.default.each(all, function (i) {
        i.value = 0;
        i.values = [];
        i.keys = [];

        // if you use tree of KEGG, uncomment below lines to hide KO nodes
        // if (i.depth == 4) {
        //     i.children = i._children;
        //     i.children = null;
        // }
    });
};

module.exports.setValues = function (tree, config, data) {

    var all = getAllNodes(tree);

    _underscore2.default.each(data, function (i) {
        var match = _underscore2.default.find(all, function (j) {
            return i['name'] === j['name'];
        });
        _underscore2.default.extend(match, i);
    });
};