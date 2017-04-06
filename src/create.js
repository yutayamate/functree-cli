'use strict';

import fs from 'fs';
import path from 'path';
import jsdom from 'jsdom';
import svg2png from 'svg2png';
import FuncTree from './functree.js';

export const command = 'create [options...]';
export const describe = 'Create visualization';

export const builder = {
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
        'choices': ['png', 'svg', 'html'],
        'default': 'svg',
        'describe': 'Specify output format type'
    },
    'c': {
        'alias': 'config',
        'type': 'string',
        'describe': 'Path to configuration JSON file'
    }
};

export const handler = (args) => {
    // Load configuration
    let config = null;
    const configPath = path.resolve(args.config || path.join(__dirname, '../etc/config.json'));
    try {
        const configString = fs.readFileSync(configPath);
        try {
            config = JSON.parse(configString);
        } catch (e) {
            process.stderr.write(`Error: Failed to parse JSON string "${configPath}"\n`.error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(`Error: Failed to open file "${configPath}"\n`.error);
        process.exit(1);
    }
    Object.assign(config, args);

    // Load tree structure data
    let tree = null;
    const treePath = path.resolve(args.tree);
    try {
        const treeString = fs.readFileSync(treePath);
        try {
            tree = JSON.parse(treeString);
        } catch (e) {
            process.stderr.write(`Error: Failed to parse JSON string "${treePath}"\n`.error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(`Error: Failed to open file "${treePath}"\n`.error);
        process.exit(1);
    }

    // Load viewer HTML and create window.document
    let document = null,
        window = null;
    const viewerHTMLPath = path.resolve(path.join(__dirname, '../templates/html/viewer.html'));
    try {
        const viewerHTMLString = fs.readFileSync(viewerHTMLPath);
        try {
            document = jsdom.jsdom(viewerHTMLString);
            window = document.defaultView;
        } catch (e) {
            process.stderr.write(`Error: Failed to parse HTML string "${treePath}"\n`.error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(`Error: Failed to open file "${treePath}"\n`.error);
        process.exit(1);
    }

    // Load user input
    const data = {};
    const inputPath = path.resolve(args.input || '/dev/stdin');
    try {
        const buffer = fs.readFileSync(inputPath);
        const lines = buffer.toString().split('\n');
        for (const line of lines) {
            // Skip header and empty line
            if (line.match(/^#/) || line === '') {
                continue;
            }
            if (line.match(/^\t/)) {
                const keys = line.trim().split('\t');
                tree['keys'] = config.displayCircles ?
                    keys.slice(1) :
                    keys;
                continue;
            }
            try {
                const item = line.split('\t');
                const name = item[0];
                if (!(item.length > 1)) {
                    throw name;
                }
                const floatItem = item.slice(1).map((i) => {
                    return parseFloat(i);
                });
                const d = {
                    'name': name,
                    'value': config.displayCircles ?
                        floatItem[0] :
                        0.0,
                    'values': config.displayCircles ?
                        floatItem.slice(1) :
                        floatItem
                };
                data[name] = d;
            } catch (e) {
                process.stderr.write(`Warning: Unexpeceted input line, skipped "${e}"\n`.warn);
            }
        }
    } catch (e) {
        process.stderr.write(`Error: Filed to open file "${inputPath}"\n`.error);
        process.exit(1);
    }

    let funcTree = new FuncTree(tree, config);

    // Re-define root node
    if (config.rootNodeName) {
        for (const i of funcTree.getNodes()) {
            if (i.name === config.rootNodeName) {
                i.keys = tree.keys;
                tree = i;
            }
        }
        funcTree = new FuncTree(tree, config);
    }

    // Create visualization
    funcTree
        .init()
        .assign(data)
        .visualize(document);

    let content;
    switch (args.format) {
        case 'png':
            const buffer = document.getElementById(config.viewerElementId).innerHTML + '\n';
            content = svg2png.sync(buffer);
            break;
        case 'svg':
            content = document.getElementById(config.viewerElementId).innerHTML + '\n';
            break;
        case 'html':
            content = jsdom.serializeDocument(document) + '\n';
            break;
    }

    // Output visualization to args.output
    try {
        const stream = args.output ?
            // Output to file
            fs.createWriteStream(null, {
                'fd': fs.openSync(path.resolve(args.output), 'w')
            }) :
            // Output to stdout
            process.stdout;
        stream.write(content);
        process.exit(0);
    } catch (e) {
        process.stderr.write(`Error: Filed to write to file "${path.resolve(args.output)}"\n`.error);
        process.exit(1);
    }

};
