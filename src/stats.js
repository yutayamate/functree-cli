'use strict';

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import tmp from 'tmp';

export const command = 'stats [options...]';
export const describe = 'Perform statistical analysis';

export const builder = {
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

export const handler = (args) => {
    // Load configuration
    let config = null;
    const configPath = path.resolve(args.config || path.join(__dirname, '../etc/config.json'));
    try {
        const configString = fs.readFileSync(configPath);
        try {
            config = JSON.parse(configString);
        } catch (e) {
            process.stderr.write(`Error: Failed to parse JSON string "${configPath}"\n`.error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(`Error: Failed to open file "${configPath}"\n`.error);
        process.exit(1);
    }
    Object.assign(config, args);

    // Write configuration to temporary file
    const tmpObj = tmp.fileSync();
    try {
        const stream = fs.createWriteStream(null, {'fd': tmpObj.fd});
        stream.write(JSON.stringify(config));
    } catch (e) {
        process.stderr.write(`Error: Filed to write to file "${tmpObj.name}"\n`.error);
        process.exit(1);
    }

    // Generate child process arguments
    const childCommand = path.resolve(path.join(__dirname, '../scripts/stats.py'));
    let childArgs = ['--tree', args.tree, '--method', args.method, '--config', tmpObj.name];
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

    const option = {
        'stdio': [
            process.stdin,      // Redirect: stdin (parent) => stdin (child)
            'pipe',             // Redirect: stdout (child) => args.output (parent)
            process.stderr      // Redirect: stderr (child) => stderr (parent)
        ]
    };
    const returnData = child_process.spawnSync(childCommand, childArgs, option);

    // In case of success to create child process
    if (returnData.status != null) {
        if (returnData.status === 0) {
            // const content = returnData.stdout.toString();
            const data = returnData.stdout;
            try {
                const stream = args.output ?
                    // Output to file
                    fs.createWriteStream(null, {
                        'fd': fs.openSync(args.output, 'w')
                    }) :
                    // Output to stdout
                    process.stdout;
                stream.write(data);
                process.exit(0);
            } catch (e) {
                process.stderr.write(`Error: Filed to write to file "${args.output}"\n`.error);
                process.exit(1);
            }
        } else if (returnData.status > 0) {
            process.stderr.write(`Error: Aborted with error status (${returnData.status}) "${childCommand}"\n`.error);
            process.stderr.write('Check if "python3" and all required packages are installed in $PATH\n'.error);
            process.exit(1);
        }

    // In case of failure to create child process (ENOENT)
    } else {
        if (returnData.error.code === 'ENOENT') {
            process.stderr.write(`Error: Failed to create child process "${childCommand}"\n`.error);
            process.exit(1);
        } else {
            process.stderr.write('Error: Unexpected error occurred\n'.error);
            process.exit(1);
        }
    }
};
