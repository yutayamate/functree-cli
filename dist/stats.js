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

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var command = exports.command = 'stats [options...]';
var describe = exports.describe = 'Perform statistical analysis';

var builder = exports.builder = {
    'i': {
        'alias': 'input',
        'type': 'array',
        'describe': 'Path to input abundance table(s)'
    },
    'o': {
        'alias': 'output',
        'type': 'string',
        'describe': 'Output result to file'
    },
    't': {
        'alias': 'tree',
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

var handler = exports.handler = function handler(args) {
    // Load configuration
    var config = null;
    var configPath = _path2.default.resolve(args.config || _path2.default.join(__dirname, '../etc/config.json'));
    try {
        var configString = _fs2.default.readFileSync(configPath);
        try {
            config = JSON.parse(configString);
        } catch (e) {
            process.stderr.write(('Error: Failed to parse JSON string "' + configPath + '"\n').error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(('Error: Failed to open file "' + configPath + '"\n').error);
        process.exit(1);
    }
    Object.assign(config, args);

    // Write configuration to temporary file
    var tmpObj = _tmp2.default.fileSync();
    try {
        var stream = _fs2.default.createWriteStream(null, { 'fd': tmpObj.fd });
        stream.write(JSON.stringify(config));
    } catch (e) {
        process.stderr.write(('Error: Filed to write to file "' + tmpObj.name + '"\n').error);
        process.exit(1);
    }

    // Generate child process arguments
    var childCommand = _path2.default.resolve(_path2.default.join(__dirname, '../scripts/stats.py'));
    var childArgs = ['--tree', args.tree, '--method', args.method, '--config', tmpObj.name];
    switch (args.method) {
        case 'mean':
        case 'sum':
        case 'var':
            // If input file is specified, add "--input" argument
            if (args.input) {
                childArgs = childArgs.concat(['--input', args.input[0]]);
            }
            break;
        case 'mannwhitneyu':
            try {
                if (args.input.length !== 2) {
                    throw new Error();
                }
                childArgs = childArgs.concat(['--input', args.input[0], args.input[1]]);
            } catch (e) {
                process.stderr.write('Error: Not enough arguments "-i, --input"\n'.error);
                process.exit(1);
            }
            break;
    }

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
                var _stream = args.output ?
                // Output to file
                _fs2.default.createWriteStream(null, {
                    'fd': _fs2.default.openSync(args.output, 'w')
                }) :
                // Output to stdout
                process.stdout;
                _stream.write(data);
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