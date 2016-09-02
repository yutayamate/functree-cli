'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.command = 'create [options...]';
module.exports.describe = 'Additional tools';

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
    'a': {
        'alias': 'analysis',
        'type': 'string',
        'choices': ['calc'],
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

    var config = io.load_config(_path2.default.join(__dirname, '../config/config.json'));

    if (args.format === 'svg') {
        var str = $('#' + config.attr.id).prop('innerHTML') + '\n';
        io.write(args.output, str);
    } else if (args.format === 'html') {
        var _str = $('html').prop('outerHTML') + '\n';
        io.write(args.output, _str);
    }

    process.exit(0);
};