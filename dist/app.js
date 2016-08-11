#!/usr/bin/env node


'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _parse = require('./parse.js');

var _parse2 = _interopRequireDefault(_parse);

var _draw = require('./draw.js');

var _draw2 = _interopRequireDefault(_draw);

var _calc = require('./calc.js');

var _calc2 = _interopRequireDefault(_calc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var template = _fs2.default.readFileSync(_path2.default.join(__dirname, '../data/template/index.html')).toString();
var document = _jsdom2.default.jsdom(template);
var window = document.defaultView;
var $ = (0, _jquery2.default)(window);

// Set up command-line arguments
var args = _yargs2.default.option('i', {
    'alias': 'input',
    'type': 'string',
    'default': '/dev/stdin',
    'describe': 'specify input file'
}).option('o', {
    'alias': 'output',
    'type': 'array',
    'default': '/dev/stdout',
    'describe': 'specify output file(s)'
}).option('d', {
    'alias': 'database',
    'type': 'string',
    'choices': ['kegg', 'enteropathway'],
    'demand': true,
    'describe': 'specify reference database'
}).argv;

var root = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '../data/ref/', args.database + '.json')));
root.x0 = 0;
root.y0 = 0;

var config = _parse2.default.parseArgsAndConfigFileObj(args, _fs2.default.readFileSync(_path2.default.join(__dirname, '../config/config.json')));

var data = _parse2.default.parseInputFileObj(_fs2.default.readFileSync(args.input), config);

// Zero-initialize values of all nodes
_calc2.default.initTree(root, config);

// Assign values of input data to tree
_calc2.default.setValues(root, config, data);

// Draw FuncTree on DOM (window.document.body)
// If you want to use jQuery in modules, let $ to window.$
_draw2.default.initImage(window, config);
_draw2.default.updateLegend(window, config);
_draw2.default.updateRings(window, config, root);
_draw2.default.updateLinks(window, config, root, root);
_draw2.default.updateNodes(window, config, root, root);
_draw2.default.updateCharts(window, config, root, root);

// Output results
if (args.output.length >= 1) {
    var fd = _fs2.default.openSync(args.output[0], 'w');
    _fs2.default.writeSync(fd, $('#ft-main').prop('innerHTML') + '\n');
}

if (args.output.length === 2) {
    var _fd = _fs2.default.openSync(args.output[1], 'w');
    _fs2.default.writeSync(_fd, $('html').prop('outerHTML') + '\n');
}

process.exit(0);