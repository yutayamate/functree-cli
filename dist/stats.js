'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _fileIo = require('./file-io.js');

var _fileIo2 = _interopRequireDefault(_fileIo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.command = 'stats [options...]';
module.exports.describe = 'Statistical analysis';

module.exports.builder = {
    'i': {
        'alias': 'input',
        'type': 'string',
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
        'demand': true,
        'describe': 'Specify reference database'
    },
    'm': {
        'alias': 'method',
        'type': 'string',
        'choices': ['sum', 'average', 'variance'],
        'demand': true,
        'describe': 'Specify analysis method'
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Specify configuration file'
    }
};

module.exports.handler = function (args) {

    var config = _fileIo2.default.load_config(args.config || _path2.default.join(__dirname, '../config/config.json'));
    var str = '';

    var cmd = _path2.default.join(__dirname, '../tools/stats.py');
    var arg = args.input ? ['-d', args.database, '-m', args.method, '-i', args.input] : ['-d', args.database, '-m', args.method];

    try {
        var result = _child_process2.default.spawnSync(cmd, arg, {
            'stdio': [0, 'pipe', 2]
        });
        str = result.stdout.toString();
    } catch (e) {
        process.stderr.write('Unexpected Error\n');
        process.exit(1);
    }

    _fileIo2.default.write(args.output, str);
    process.exit(0);
};