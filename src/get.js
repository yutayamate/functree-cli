'use strict'

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

module.exports.command = 'get [options...]';
module.exports.describe = 'Get tree structure data from database';

module.exports.builder = {
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
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Path to configuration JSON file'
    }
};

module.exports.handler = (args) => {
    const childCommand = path.resolve(path.join(__dirname, '../tools/get.py'));
    const childArgs = ['--database', args.database];
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
                process.stderr.write(`Error: Filed to write to file "${args.output}"\n`);
                process.exit(1);
            }
        } else if (returnData.status > 0) {
            process.stderr.write(`Error: Aborted with error status (${returnData.status}) "${childCommand}"\n`);
            process.stderr.write("Check if \"python3\" and all required packages are installed in $PATH\n");
            process.exit(1);
        }

    // In case of failure to create child process (ENOENT)
    } else {
        if (returnData.error.code === 'ENOENT') {
            process.stderr.write(`Error: Failed to create child process "${childCommand}"\n`);
            process.exit(1);
        } else {
            process.stderr.write(`Error: Unexpected error occurred"\n`);
            process.exit(1);
        }
    }
};
