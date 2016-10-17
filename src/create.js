'use strict'

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import jsdom from 'jsdom';

import io from './io.js';
import util from './util.js';
import functree from './functree.js';


module.exports.command = 'create [options...]';
module.exports.describe = 'Create a visualization';


module.exports.builder = {
    't': {
        'alias': 'theme',
        'type': 'string',
        'choices': ['functree'],
        'default': 'functree',
        'describe': 'Specify visualization theme'
    },
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
    'f': {
        'alias': 'format',
        'type': 'string',
        'choices': ['svg', 'html', 'png'],
        'default': 'svg',
        'describe': 'Specify output format'
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Specify configuration file'
    }
};


module.exports.handler = (args) => {

    let config = io.load_config(args.config || path.join(__dirname, '../config/config.json'));

    let template = io.read(path.join(__dirname, '../data/template/index.html'));
    let document = jsdom.jsdom(template);
    let window = document.defaultView;

    let data = io.read_input(args.input);
    let ref = io.load_ref(path.join(__dirname, '../data/ref/', args.database + '.json'));
    let nodes = util.get_nodes(ref);


    if (args.theme === 'functree') {

        ref.x0 = ref.y0 = 0;

        util.init_nodes(nodes, config);
        util.set_values(nodes, data, config);

        functree.main(window, ref, config);

    }


    if (args.format === 'svg') {

        let str = document.getElementById('main') + '\n';
        io.write(args.output, str);

    } else if (args.format === 'html') {

        let str = jsdom.serializeDocument(document) + '\n';
        io.write(args.output, str);

    } else if (args.format === 'png') {

    }

    process.exit(0);

};
