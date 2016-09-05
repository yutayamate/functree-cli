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
        // 'default': '/dev/stdin',
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
        'choices': ['abundance'],
        'demand': true,
        'describe': 'Specify analyze method'
    },
};


module.exports.handler = (args) => {

    let config = io.load_config(path.join(__dirname, '../config/config.json'));
    let str = '';

    if (args.method === 'abundance') {

        let cmd = path.join(__dirname, '../tool/abundance.py');
        let arg = args.input ? ['-d', args.database, '-m', 'sum', '-i', args.input] : ['-d', args.database, '-m', 'sum'];

        try {
            let result = child_process.spawnSync(cmd, arg, {
                'stdio': [0, 'pipe', 2]
            });
            str = result.stdout.toString();
        }

        catch(e) {
            process.stderr.write('Unexpected Error\n');
            process.exit(1);
        }

    }

    io.write(args.output, str);
    process.exit(0);

};