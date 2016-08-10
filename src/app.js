#!/usr/bin/env node

'use strict'

import fs from 'fs';
import argv from 'argv';
import jsdom from 'jsdom';
import jQuery from 'jquery';

import parse from './parse.js';
import draw from './draw.js';
import calc from './calc.js';


let template = fs.readFileSync(__dirname + '/../data/template/index.html').toString();
let document = jsdom.jsdom(template);
let window = document.defaultView;
let $ = jQuery(window);


// Set up command-line arguments
let args = argv.option(
    [
        {
            'name': 'input',
            'short': 'i',
            'type': 'path',
            'description': 'Specify input file'
        },
        {
            'name': 'output',
            'short': 'o',
            'type': 'list,path',
            'description': 'Specify output file'
        },
        {
            'name': 'database',
            'short': 'd',
            'type': 'string',
            'description': 'Specify reference database (kegg or enteropathway)'
        }
    ])
    .version('functree-cli (0.0.1)')
    .run();


// Check whether option was specifyed
if (!args['options']['input'] || !args['options']['output']) {
    argv.help();
    process.exit(1);
}


let root = JSON.parse(fs.readFileSync(__dirname + '/../data/ref/enteropathway.json'));
    root.x0 = 0;
    root.y0 = 0;

let config = parse.parseArgsAndConfigFileObj(
    args,
    fs.readFileSync(__dirname + '/../config/config.json')
);

let data = parse.parseInputFileObj(
    fs.readFileSync(args['options']['input']),
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


// Output SVG to stdout
// console.log(window.document.body.innerHTML);
// console.log(window.document.documentElement);
// console.log($('html').prop('outerHTML'));

fs.writeFileSync(args['options']['output'][0], $('html').prop('outerHTML'));
fs.writeFileSync(args['options']['output'][1], $('#viz').prop('innerHTML'));
// fs.writeFileSync(args['options']['output'], window.document.body.innerHTML);

// let s = fs.readFileSync(__dirname + '/../content/index.html').toString();
// fs.writeFileSync(args['options']['output'][1], s);
