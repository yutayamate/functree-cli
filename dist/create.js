'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _io = require('./io.js');

var _io2 = _interopRequireDefault(_io);

var _draw = require('./draw.js');

var _draw2 = _interopRequireDefault(_draw);

var _calc = require('./calc.js');

var _calc2 = _interopRequireDefault(_calc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.command = 'create [options...]';
module.exports.describe = 'Create a visualization';

module.exports.builder = {
    'i': {
        'alias': 'input',
        'type': 'string',
        'default': '/dev/stdin',
        'describe': 'Specify input file'
    },
    'o': {
        'alias': 'output',
        'type': 'string',
        'default': '/dev/stdout',
        'describe': 'Specify output file'
    },
    'd': {
        'alias': 'database',
        'type': 'string',
        'choices': ['kegg', 'enteropathway'],
        'demand': true,
        'describe': 'Specify reference database'
    },
    'f': {
        'alias': 'format',
        'type': 'string',
        'choices': ['svg', 'html'],
        'default': 'svg',
        'describe': 'Specify output format'
    }
};

module.exports.handler = function (args) {

    var config = _io2.default.load_config(_path2.default.join(__dirname, '../config/config.json'));

    var template = _io2.default.read(_path2.default.join(__dirname, '../data/template/index.html'));
    var document = _jsdom2.default.jsdom(template);
    var window = document.defaultView;
    var $ = (0, _jquery2.default)(window);

    var ref = _io2.default.load_ref(_path2.default.join(__dirname, '../data/ref/', args.database + '.json'));
    ref.x0 = 0;
    ref.y0 = 0;
    var data = _io2.default.read_input(args.input);

    // Zero-initialize values of all nodes
    _calc2.default.initTree(ref, config);

    // Assign values of input data to tree
    _calc2.default.setValues(ref, config, data);

    // Draw FuncTree on DOM (window.document.body)
    // If you want to use jQuery in modules, let $ to window.$
    _draw2.default.initImage(window, config);
    _draw2.default.updateLegend(window, config);
    _draw2.default.updateRings(window, config, ref);
    _draw2.default.updateLinks(window, config, ref, ref);
    _draw2.default.updateNodes(window, config, ref, ref);
    _draw2.default.updateCharts(window, config, ref, ref);

    // Write a visualization to args.output
    if (args.format === 'svg') {
        var str = $('#' + config.attr.id).prop('innerHTML').trim() + '\n';
        _io2.default.write(args.output, str);
    } else if (args.format === 'html') {
        var _str = $('html').prop('outerHTML').trim() + '\n';
        _io2.default.write(args.output, _str);
    }

    process.exit(0);
};