'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _fileIo = require('./file-io.js');

var _fileIo2 = _interopRequireDefault(_fileIo);

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

var _functree = require('./functree.js');

var _functree2 = _interopRequireDefault(_functree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.command = 'create [options...]';
module.exports.describe = 'Create visualization';

module.exports.builder = {
    't': {
        'alias': 'theme',
        'type': 'string',
        'choices': ['functree'],
        'default': 'functree',
        'describe': 'Specify theme of visualization'
    },
    'i': {
        'alias': 'input',
        'type': 'string',
        'default': '/dev/stdin',
        'describe': 'Path to input abundance table'
    },
    'o': {
        'alias': 'output',
        'type': 'string',
        'default': '/dev/stdout',
        'describe': 'Output visualization image to file'
    },
    'd': {
        'alias': 'database',
        'type': 'string',
        'demand': true,
        'describe': 'Path to tree structure data JSON file'
    },
    'f': {
        'alias': 'format',
        'type': 'string',
        'choices': ['svg', 'html', 'png'],
        'default': 'svg',
        'describe': 'Specify output format type'
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Path to configuration JSON file'
    }
};

module.exports.handler = function (args) {

    var config = _fileIo2.default.load_config(args.config || _path2.default.join(__dirname, '../config/config.json'));

    var template = _fileIo2.default.read(_path2.default.join(__dirname, '../data/html/template.html'));
    var document = _jsdom2.default.jsdom(template);
    var window = document.defaultView;

    var data = _fileIo2.default.read_input(args.input, config);
    var ref = _fileIo2.default.load_ref(args.database);
    var nodes = _util2.default.get_nodes(ref);

    if (args.theme === 'functree') {

        ref.x0 = ref.y0 = 0;

        _util2.default.init_nodes(nodes, config);
        _util2.default.set_values(nodes, data, config);

        _functree2.default.main(window, ref, config);
    }

    if (args.format === 'svg') {

        var str = document.getElementById(config.target_id).innerHTML + '\n';
        _fileIo2.default.write(args.output, str);
    } else if (args.format === 'html') {

        var _str = _jsdom2.default.serializeDocument(document) + '\n';
        _fileIo2.default.write(args.output, _str);
    } else if (args.format === 'png') {

        // in progress

    }

    process.exit(0);
};