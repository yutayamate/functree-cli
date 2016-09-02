'use strict'

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import io from './io.js';


module.exports.command = 'stats [options...]';
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


module.exports.handler = (args) => {

    let fd = fs.readFileSync(args.input);
    let config = io.load_config(path.join(__dirname, '../config/config.json'));
    let str = '';

    if (args.method === 'hello') {

        try {
            let cmd = path.join(__dirname, '../tool/hello.py');
            let result = child_process.spawnSync(cmd, [fd]);
            str = result.stdout.toString();
        }

        catch (e) {
            process.stderr.write('Unexpeceted Error\n');
            process.exit(1);
        }

    } else if (args.method === 'abundance') {

        try {
            let cmd = path.join(__dirname, '../tool/abundance.py');
            let result = child_process.spawnSync(cmd, ['-d', args.database, '-m', 'sum'], {
                'stdio': [ process.stdin, 'pipe', 'pipe' ]
            });
            str = result.stdout.toString();
        }

        catch(e) {
            process.stderr.write('Unexpeceted Error\n');
            process.exit(1);
        }

    }

    io.write(args.output, str);
    process.exit(0);

};