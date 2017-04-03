'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handler = exports.builder = exports.describe = exports.command = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var command = exports.command = 'get [options...]';
var describe = exports.describe = 'Get tree structure data from database';

var builder = exports.builder = {
    'o': {
        'alias': 'output',
        'type': 'string',
        'describe': 'Output tree structure data to file in JSON format'
    },
    'd': {
        'alias': 'database',
        'type': 'string',
        'choices': ['kegg'],
        'demand': true,
        'describe': 'Name of source database'
    }
};

var handler = exports.handler = function handler(args) {
    var childCommand = _path2.default.resolve(_path2.default.join(__dirname, '../scripts/get.py'));
    var childArgs = ['--database', args.database];
    var option = {
        'stdio': [process.stdin, // Redirect: stdin (parent) => stdin (child)
        'pipe', // Redirect: stdout (child) => args.output (parent)
        process.stderr // Redirect: stderr (child) => stderr (parent)
        ]
    };
    var returnData = _child_process2.default.spawnSync(childCommand, childArgs, option);

    // In case of success to create child process
    if (returnData.status != null) {
        if (returnData.status === 0) {
            // const content = returnData.stdout.toString();
            var data = returnData.stdout;
            try {
                var stream = args.output ?
                // Output to file
                _fs2.default.createWriteStream(null, {
                    'fd': _fs2.default.openSync(args.output, 'w')
                }) :
                // Output to stdout
                process.stdout;
                stream.write(data);
                process.exit(0);
            } catch (e) {
                process.stderr.write(('Error: Filed to write to file "' + args.output + '"\n').error);
                process.exit(1);
            }
        } else if (returnData.status > 0) {
            process.stderr.write(('Error: Aborted with error status (' + returnData.status + ') "' + childCommand + '"\n').error);
            process.stderr.write("Check if \"python3\" and all required packages are installed in $PATH\n".error);
            process.exit(1);
        }

        // In case of failure to create child process (ENOENT)
    } else {
        if (returnData.error.code === 'ENOENT') {
            process.stderr.write(('Error: Failed to create child process "' + childCommand + '"\n').error);
            process.exit(1);
        } else {
            process.stderr.write('Error: Unexpected error occurred"\n'.error);
            process.exit(1);
        }
    }
};