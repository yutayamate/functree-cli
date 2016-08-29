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

var _io = require('./io.js');

var _io2 = _interopRequireDefault(_io);

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
var args = _yargs2.default.locale('en').option('i', {
    'alias': 'input',
    'type': 'string',
    'default': '/dev/stdin',
    'describe': 'Specify input file'
}).option('o', {
    'alias': 'output',
    'type': 'array',
    'default': '/dev/stdout',
    'describe': 'Specify output file(s)'
}).option('d', {
    'alias': 'database',
    'type': 'string',
    'choices': ['kegg', 'enteropathway'],
    'demand': true,
    'describe': 'Specify reference database'
}).usage(' _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___ \n' + '|  ___| | | | \\ | |/ ___|_   _|  _ \\| ____| ____|     / ___| |   |_ _|\n' + '| |_  | | | |  \\| | |     | | | |_) |  _| |  _| _____| |   | |    | | \n' + '|  _| | |_| | |\\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | | \n' + '|_|    \\___/|_| \\_|\\____| |_| |_| \\_\\_____|_____|     \\____|_____|___|\n' + '                                                                      \n' + '[ A Command-line based visualization tool for massive-scale omics data ]\n' + '\n' + 'For details, please see:\n' + '  http://wwww.bioviz.tokyo/functree2\n').help('h').argv;

var ref = _io2.default.load_ref(_path2.default.join(__dirname, '../data/ref/', args.database + '.json'));
ref.x0 = 0;
ref.y0 = 0;
var config = _io2.default.load_config(_path2.default.join(__dirname, '../config/config.json'));
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

// Output results
if (args.output.length >= 1) {
    var str = $('#ft-main').prop('innerHTML') + '\n';
    _io2.default.write(args.output[0], str);
}

if (args.output.length === 2) {
    var _str = $('html').prop('outerHTML') + '\n';
    _io2.default.write(args.output[1], _str);
}

process.exit(0);