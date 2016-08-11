#!/usr/bin/env node

'use strict'

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import jsdom from 'jsdom';
import jQuery from 'jquery';

import parse from './parse.js';
import draw from './draw.js';
import calc from './calc.js';


let template = fs.readFileSync(path.join(__dirname, '../data/template/index.html')).toString();
let document = jsdom.jsdom(template);
let window = document.defaultView;
let $ = jQuery(window);


// Set up command-line arguments
let args = yargs
    .option('i',
        {
            'alias': 'input',
            'type': 'string',
            'default': '/dev/stdin',
            'describe': 'specify input file'
        }
    )
    .option('o',
        {
            'alias': 'output',
            'type': 'array',
            'default': '/dev/stdout',
            'describe': 'specify output file(s)'
        }
    )
    .option('d',
        {
            'alias': 'database',
            'type': 'string',
            'choices': ['kegg', 'enteropathway'],
            'demand': true,
            'describe': 'specify reference database'
        }
    )
    .argv;


let root = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ref/', args.database + '.json')));
    root.x0 = 0;
    root.y0 = 0;

let config = parse.parseArgsAndConfigFileObj(
    args,
    fs.readFileSync(path.join(__dirname, '../config/config.json'))
);

let data = parse.parseInputFileObj(
    fs.readFileSync(args.input),
    config
);

// Zero-initialize values of all nodes
calc.initTree(root, config);

// Assign values of input data to tree
calc.setValues(root, config, data);


// Draw FuncTree on DOM (window.document.body)
// If you want to use jQuery in modules, let $ to window.$
draw.initImage(window, config);
draw.updateLegend(window, config);
draw.updateRings(window, config, root);
draw.updateLinks(window, config, root, root);
draw.updateNodes(window, config, root, root);
draw.updateCharts(window, config, root, root);


// Output results
if (args.output.length >= 1) {
    let fd = fs.openSync(args.output[0], 'w');
    fs.writeSync(fd, $('#ft-main').prop('innerHTML') + '\n');
}

if (args.output.length === 2) {
    let fd = fs.openSync(args.output[1], 'w');
    fs.writeSync(fd, $('html').prop('outerHTML') + '\n');
}

process.exit(0);