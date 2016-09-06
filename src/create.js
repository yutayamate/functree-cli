'use strict'

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import jsdom from 'jsdom';
import jQuery from 'jquery';

import io from './io.js';
import util from './util.js';
import functree from './functree.js';


module.exports.command = 'create [options...]';
module.exports.describe = 'Create a visualization';


module.exports.builder = {
    't': {
        'alias': 'theme',
        'type': 'string',
        'default': 'functree',
        'choices': ['functree'],
        'demand': true,
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
        'choices': ['svg', 'html'],
        'default': 'svg',
        'describe': 'Specify output format'
    }
};


module.exports.handler = (args) => {

    let config = io.load_config(path.join(__dirname, '../config/config.json'));

    let template = io.read(path.join(__dirname, '../data/template/index.html'));
    let document = jsdom.jsdom(template);
    let window = document.defaultView;
    let $ = jQuery(window);

    let data = io.read_input(args.input);
    let ref = io.load_ref(path.join(__dirname, '../data/ref/', args.database + '.json'));
    let nodes = util.get_nodes(ref);


    // Draw FuncTree
    if (args.theme === 'functree') {

        // Set root position
        ref.x0 = ref.y0 = 0;

        // Zero-initialize values of all nodes
        util.init_nodes(nodes, config);
        // Assign values of input data to tree
        util.set_values(nodes, data, config);

        // Draw FuncTree on DOM (window.document.body)
        functree.main(window, ref, config);

    }


    // Write a visualization to args.output
    if (args.format === 'svg') {
        let str = $('#' + config.target_id).prop('innerHTML').trim() + '\n';
        io.write(args.output, str);
    } else if (args.format === 'html') {
        let str = $('html').prop('outerHTML').trim() + '\n';
        io.write(args.output, str);
    }

    process.exit(0);

};