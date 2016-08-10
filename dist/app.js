#!/usr/bin/env node


'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _argv = require('argv');

var _argv2 = _interopRequireDefault(_argv);

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

var template = _fs2.default.readFileSync(__dirname + '/../data/template/index.html').toString();
var document = _jsdom2.default.jsdom(template);
var window = document.defaultView;
var $ = (0, _jquery2.default)(window);

// Set up command-line arguments
var args = _argv2.default.option([{
    'name': 'input',
    'short': 'i',
    'type': 'path',
    'description': 'Specify input file'
}, {
    'name': 'output',
    'short': 'o',
    'type': 'list,path',
    'description': 'Specify output file'
}, {
    'name': 'database',
    'short': 'd',
    'type': 'string',
    'description': 'Specify reference database (kegg or enteropathway)'
}]).version('functree-cli (0.0.1)').run();

// Check whether option was specifyed
if (!args['options']['input'] || !args['options']['output']) {
    _argv2.default.help();
    process.exit(1);
}

var root = JSON.parse(_fs2.default.readFileSync(__dirname + '/../data/ref/enteropathway.json'));
root.x0 = 0;
root.y0 = 0;

var config = _parse2.default.parseArgsAndConfigFileObj(args, _fs2.default.readFileSync(__dirname + '/../config/config.json'));

var data = _parse2.default.parseInputFileObj(_fs2.default.readFileSync(args['options']['input']), config);

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

// Output SVG to stdout
// console.log(window.document.body.innerHTML);
// console.log(window.document.documentElement);
// console.log($('html').prop('outerHTML'));

_fs2.default.writeFileSync(args['options']['output'][0], $('html').prop('outerHTML'));
_fs2.default.writeFileSync(args['options']['output'][1], $('#viz').prop('innerHTML'));
// fs.writeFileSync(args['options']['output'], window.document.body.innerHTML);

// let s = fs.readFileSync(__dirname + '/../content/index.html').toString();
// fs.writeFileSync(args['options']['output'][1], s);