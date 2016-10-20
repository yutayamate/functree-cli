'use strict'

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import io from './io.js';


module.exports.command = 'get [options...]';
module.exports.describe = 'Get reference dataset from KEGG / EnteroPathway';


module.exports.builder = {
    'o': {
        'alias': 'output',
        'type': 'string',
        'default': '/dev/stdout',
        'describe': 'Specify output file'
    },
    'd': {
        'alias': 'database',
        'type': 'string',
        'choices': ['kegg'],
        'demand': true,
        'describe': 'Specify reference database'
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Specify configuration file'
    }
};


module.exports.handler = (args) => {

    let config = io.load_config(args.config || path.join(__dirname, '../config/config.json'));
    let str = '';

    let cmd = path.join(__dirname, '../tool/get.py');
    let arg = ['-d', args.database];

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


    io.write(args.output, str);
    process.exit(0);

};
