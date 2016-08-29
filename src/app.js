#!/usr/bin/env node

'use strict'

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import jsdom from 'jsdom';
import jQuery from 'jquery';

import io from './io.js';
import draw from './draw.js';
import calc from './calc.js';


let template = fs.readFileSync(path.join(__dirname, '../data/template/index.html')).toString();
let document = jsdom.jsdom(template);
let window = document.defaultView;
let $ = jQuery(window);


// Set up command-line arguments
let args = yargs
    .locale('en')
    .option('i',
        {
            'alias': 'input',
            'type': 'string',
            'default': '/dev/stdin',
            'describe': 'Specify input file'
        }
    )
    .option('o',
        {
            'alias': 'output',
            'type': 'array',
            'default': '/dev/stdout',
            'describe': 'Specify output file(s)'
        }
    )
    .option('d',
        {
            'alias': 'database',
            'type': 'string',
            'choices': ['kegg', 'enteropathway'],
            'demand': true,
            'describe': 'Specify reference database'
        }
    )
    .usage(
        ' _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___ \n' +
        '|  ___| | | | \\ | |/ ___|_   _|  _ \\| ____| ____|     / ___| |   |_ _|\n' +
        '| |_  | | | |  \\| | |     | | | |_) |  _| |  _| _____| |   | |    | | \n' +
        '|  _| | |_| | |\\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | | \n' +
        '|_|    \\___/|_| \\_|\\____| |_| |_| \\_\\_____|_____|     \\____|_____|___|\n' +
        '                                                                      \n' +
        '[ A Command-line based visualization tool for massive-scale omics data ]\n' +
        '\n' +
        'For details, please see:\n' +
        '  http://wwww.bioviz.tokyo/functree2\n'
    )
    .help('h')
    .argv;


let ref = io.load_ref(path.join(__dirname, '../data/ref/', args.database + '.json'));
    ref.x0 = 0;
    ref.y0 = 0;
let config = io.load_config(path.join(__dirname, '../config/config.json'));
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




// Output results
if (args.output.length >= 1) {
    let str = $('#ft-main').prop('innerHTML') + '\n';
    io.write(args.output[0], str);
}

if (args.output.length === 2) {
    let str = $('html').prop('outerHTML') + '\n'
    io.write(args.output[1], str);
}

process.exit(0);
