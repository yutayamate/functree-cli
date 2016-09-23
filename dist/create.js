'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _io = require('./io.js');

var _io2 = _interopRequireDefault(_io);

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

var _functree = require('./functree.js');

var _functree2 = _interopRequireDefault(_functree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.command = 'create [options...]';
// import jQuery from 'jquery';

module.exports.describe = 'Create a visualization';

module.exports.builder = {
    't': {
        'alias': 'theme',
        'type': 'string',
        'choices': ['functree'],
        'default': 'functree',
        'describe': 'Specify visualization theme'
    },
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
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Specify configuration file'
    }
};

module.exports.handler = function (args) {

    var config = _io2.default.load_config(args.config || _path2.default.join(__dirname, '../config/config.json'));

    var template = _io2.default.read(_path2.default.join(__dirname, '../data/template/index.html'));
    var document = _jsdom2.default.jsdom(template);
    var window = document.defaultView;
    // let $ = jQuery(window);

    var data = _io2.default.read_input(args.input);
    var ref = _io2.default.load_ref(_path2.default.join(__dirname, '../data/ref/', args.database + '.json'));
    var nodes = _util2.default.get_nodes(ref);

    if (args.theme === 'functree') {

        ref.x0 = ref.y0 = 0;

        _util2.default.init_nodes(nodes, config);
        _util2.default.set_values(nodes, data, config);

        _functree2.default.main(window, ref, config);
    }

    if (args.format === 'svg') {
        var str = document.getElementById(config.target_id).innerHTML.trim() + '\n';
        _io2.default.write(args.output, str);
    } else if (args.format === 'html') {
        var _str = _jsdom2.default.serializeDocument(document) + '\n';
        _io2.default.write(args.output, _str);
    }

    process.exit(0);
};