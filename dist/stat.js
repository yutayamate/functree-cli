'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _io = require('./io.js');

var _io2 = _interopRequireDefault(_io);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.command = 'stat [options...]';
module.exports.describe = 'Statistical analysis';

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
    'm': {
        'alias': 'method',
        'type': 'string',
        'choices': ['hello', 'abundance'],
        'demand': true,
        'describe': 'Specify analyze method'
    }
};

module.exports.handler = function (args) {

    var fd = _fs2.default.readFileSync(args.input);
    var config = _io2.default.load_config(_path2.default.join(__dirname, '../config/config.json'));
    var str = '';

    if (args.method === 'hello') {

        try {
            var cmd = _path2.default.join(__dirname, '../tool/hello.py');
            var _result = _child_process2.default.spawnSync(cmd, [fd]);
            str = _result.stdout.toString();
        } catch (e) {
            process.stderr.write('Unexpeceted Error\n');
            process.exit(1);
        }
    } else if (args.method === 'abundance') {

        try {
            var _cmd = _path2.default.join(__dirname, '../tool/abundance.py');
            // let result = child_process.spawnSync(cmd, ['-d', args.database, '-m', 'sum'], {
            //     'stdio': [ process.stdin, 'pipe', 'pipe' ]
            // });
            console.log(result.stderr.toString());
            str = result.stdout.toString();
        } catch (e) {
            process.stderr.write('Unexpeceted Error\n');
            process.exit(1);
        }
    }

    _io2.default.write(args.output, str);
    process.exit(0);
};