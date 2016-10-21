'use strict'

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import file_io from './file-io.js';


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
        'choices': ['kegg', 'enteropathway'],
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


module.exports.handler = (args) => {

    let config = file_io.load_config(args.config || path.join(__dirname, '../config/config.json'));
    let str = '';

    let cmd = path.join(__dirname, '../tools/stats.py');
    let arg = args.input ? ['-d', args.database, '-m', args.method, '-i', args.input] : ['-d', args.database, '-m', args.method];

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


    file_io.write(args.output, str);
    process.exit(0);

};
