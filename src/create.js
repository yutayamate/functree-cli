'use strict'

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import jsdom from 'jsdom';

import file_io from './file-io.js';
import util from './util.js';
import functree from './functree.js';


module.exports.command = 'create [options...]';
module.exports.describe = 'Create visualization';


module.exports.builder = {
    't': {
        'alias': 'theme',
        'type': 'string',
        'choices': ['functree'],
        'default': 'functree',
        'describe': 'Specify theme of visualization'
    },
    'i': {
        'alias': 'input',
        'type': 'string',
        'default': '/dev/stdin',
        'describe': 'Path to input abundance table'
    },
    'o': {
        'alias': 'output',
        'type': 'string',
        'default': '/dev/stdout',
        'describe': 'Output visualization image to file'
    },
    'd': {
        'alias': 'database',
        'type': 'string',
        'demand': true,
        'describe': 'Path to tree structure data JSON file'
    },
    'f': {
        'alias': 'format',
        'type': 'string',
        'choices': ['svg', 'html', 'png'],
        'default': 'svg',
        'describe': 'Specify output format type'
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Path to configuration JSON file'
    }
};


module.exports.handler = (args) => {

    let config = file_io.load_config(args.config || path.join(__dirname, '../config/config.json'));

    let template = file_io.read(path.join(__dirname, '../data/html/template.html'));
    let document = jsdom.jsdom(template);
    let window = document.defaultView;

    let data = file_io.read_input(args.input, config);
    let ref = file_io.load_ref(args.database);
    let nodes = util.get_nodes(ref);


    if (args.theme === 'functree') {

        ref.x0 = ref.y0 = 0;

        util.init_nodes(nodes, config);
        util.set_values(nodes, data, config);

        functree.main(window, ref, config);

    }


    if (args.format === 'svg') {

        let str = document.getElementById(config.target_id).innerHTML + '\n';
        file_io.write(args.output, str);

    } else if (args.format === 'html') {

        let str = jsdom.serializeDocument(document) + '\n';
        file_io.write(args.output, str);

    } else if (args.format === 'png') {

        // in progress

    }

    process.exit(0);

};
