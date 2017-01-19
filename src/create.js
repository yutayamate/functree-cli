'use strict'

import fs from 'fs';
import path from 'path';
import jsdom from 'jsdom';
import svg2png from 'svg2png';
import util from './util.js';
import functree from './functree.js';

module.exports.command = 'create [options...]';
module.exports.describe = 'Create visualization';

module.exports.builder = {
    'i': {
        'alias': 'input',
        'type': 'string',
        'describe': 'Path to input abundance table'
    },
    'o': {
        'alias': 'output',
        'type': 'string',
        'describe': 'Output visualization image to file'
    },
    't': {
        'alias': 'tree',
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
    // Load configuration
    let config = {};
    const configPath = path.resolve(args.config || path.join(__dirname, '../config/config.json'));
    try {
        const configString = fs.readFileSync(configPath);
        try {
            config = JSON.parse(configString);
        } catch (e) {
            process.stderr.write(`Error: Failed to parse JSON string "${configPath}"\n`);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(`Error: Failed to open file "${configPath}"\n`);
        process.exit(1);
    }

    // Load tree structure data
    let tree = {};
    const treePath = path.resolve(args.tree);
    try {
        const treeString = fs.readFileSync(treePath);
        try {
            tree = JSON.parse(treeString);
        } catch (e) {
            process.stderr.write(`Error: Failed to parse JSON string "${treePath}"\n`);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(`Error: Failed to open configuration file "${treePath}"\n`);
        process.exit(1);
    }

    // Load template HTML and create window.document
    let document = null,
        window = null;
    const templateHTMLPath = path.resolve(path.join(__dirname, '../data/html/template.html'));
    try {
        const templateHTMLString = fs.readFileSync(templateHTMLPath);
        try {
            document = jsdom.jsdom(templateHTMLString);
            window = document.defaultView;
        } catch (e) {
            process.stderr.write(`Error: Failed to parse HTML string "${treePath}"\n`);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(`Error: Failed to open template HTML file "${treePath}"\n`);
        process.exit(1);
    }

    // Load user's input
    let data = [];
    const inputPath = path.resolve(args.input || '/dev/stdin');
    try {
        const fd = fs.readFileSync(inputPath);
        const inputString = fd.toString();
        for (const line of inputString.split('\n')) {
            if (line.match('#') || line === '') {
                continue
            }
            try {
                const item = line.split('\t');
                const d = {
                    'name': item[0],
                    'value': config.functree.use_1stcol_as_radius ? parseFloat(item[1]) : 0.0,
                    'values': item.slice(config.functree.use_1stcol_as_radius ? 2 : 1).map((i) => {
                        return parseFloat(i);
                    })
                };
                data.push(d);
            } catch (e) {
                // Not work well...
                process.stderr.write('Warrning: Unexpeceted input type, skipped');
            }
        }
    } catch (e) {
        process.stderr.write(`Error: Filed to open file "${inputPath}"\n`);
        process.exit(1);
    }

    let nodes = util.get_nodes(tree);
    tree.x0 = tree.y0 = 0;
    util.init_nodes(nodes, config);
    util.set_values(nodes, data, config);
    functree.main(window, tree, config);

    // Output visualization to args.output
    let content;
    if (args.format === 'svg') {
        content = document.getElementById(config.target_id).innerHTML + '\n';
    } else if (args.format === 'png') {
        let buffer = document.getElementById(config.target_id).innerHTML + '\n';
        content = svg2png.sync(buffer);
    } else if (args.format === 'html') {
        content = jsdom.serializeDocument(document) + '\n';
    }

    try {
        const stream = args.output ?
            // Output to file
            fs.createWriteStream(null, {
                'fd': fs.openSync(args.output, 'w')
            }) :
            // Output to stdout
            process.stdout;
        stream.write(content);
        process.exit(0);
    } catch (e) {
        process.stderr.write(`Error: Filed to write to file "${args.output}"\n`);
        process.exit(1);
    }

};
