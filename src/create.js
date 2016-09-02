'use strict'

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import jsdom from 'jsdom';
import jQuery from 'jquery';

import io from './io.js';
import draw from './draw.js';
import calc from './calc.js';


module.exports.command = 'create [options...]';
module.exports.describe = 'Create a visualization';


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


    let ref = io.load_ref(path.join(__dirname, '../data/ref/', args.database + '.json'));
        ref.x0 = 0;
        ref.y0 = 0;
    let data = io.read_input(args.input);


    // Zero-initialize values of all nodes
    calc.initTree(ref, config);

    // Assign values of input data to tree
    calc.setValues(ref, config, data);


    // Draw FuncTree on DOM (window.document.body)
    // If you want to use jQuery in modules, let $ to window.$
    draw.initImage(window, config);
    draw.updateLegend(window, config);
    draw.updateRings(window, config, ref);
    draw.updateLinks(window, config, ref, ref);
    draw.updateNodes(window, config, ref, ref);
    draw.updateCharts(window, config, ref, ref);


    // Write a visualization to args.output
    if (args.format === 'svg') {
        let str = $('#' + config.attr.id).prop('innerHTML').trim() + '\n';
        io.write(args.output, str);
    } else if (args.format === 'html') {
        let str = $('html').prop('outerHTML').trim() + '\n';
        io.write(args.output, str);
    }

    process.exit(0);

};