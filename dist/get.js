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

module.exports.command = 'get [options...]';
module.exports.describe = 'Get tree structure data from database';

module.exports.builder = {
    'o': {
        'alias': 'output',
        'type': 'string',
        'default': '/dev/stdout',
        'describe': 'Output tree structure data to file in JSON format'
    },
    'd': {
        'alias': 'database',
        'type': 'string',
        'choices': ['kegg'],
        'demand': true,
        'describe': 'Name of source database'
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Path to configuration JSON file'
    }
};

module.exports.handler = function (args) {

    var cmd = _path2.default.join(__dirname, '../tools/get.py');
    var arg = ['-d', args.database];

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