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
module.exports.describe = 'Perform statistical analysis';

module.exports.builder = {
    'i': {
        'alias': 'input',
        'type': 'array',
        'describe': 'Path to input abundance table(s)'
    },
    'o': {
        'alias': 'output',
        'type': 'string',
        'default': '/dev/stdout',
        'describe': 'Output result to file'
    },
    'd': {
        'alias': 'database',
        'type': 'string',
        'demand': true,
        'describe': 'Path to tree structure data JSON file'
    },
    'm': {
        'alias': 'method',
        'type': 'string',
        'choices': ['sum', 'mean', 'var', 'mannwhitneyu'],
        'demand': true,
        'describe': 'Specify statistical analysis method'
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Path to configuration JSON file'
    }
};

module.exports.handler = function (args) {

    var cmd = _path2.default.join(__dirname, '../tools/stats.py');
    var arg = '';

    // Input from "/dev/stdin"
    if (!args.input) {
        arg = args.config ? ['-d', args.database, '-m', args.method, '-c', args.config] : ['-d', args.database, '-m', args.method];
        // Input from file
    } else if (args.input.length === 1) {
        arg = args.config ? ['-d', args.database, '-m', args.method, '-i', args.input[0], '-c', args.config] : ['-d', args.database, '-m', args.method, '-i', args.input[0]];
    } else if (args.input.length === 2) {
        arg = args.config ? ['-d', args.database, '-m', args.method, '-i', args.input[0], args.input[1], '-c', args.config] : ['-d', args.database, '-m', args.method, '-i', args.input[0], args.input[1]];
    }

    var str = '';
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