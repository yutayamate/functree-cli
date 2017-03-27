'use strict'

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

    // Load template HTML and create window.document
    let document = null,
        window = null;
    const templateHTMLPath = path.resolve(path.join(__dirname, '../templates/html/viewer.html'));
    try {
        const templateHTMLString = fs.readFileSync(templateHTMLPath);
        try {
            document = jsdom.jsdom(templateHTMLString);
            window = document.defaultView;
        } catch (e) {
            process.stderr.write(`Error: Failed to parse HTML string "${treePath}"\n`.error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(`Error: Failed to open file "${treePath}"\n`.error);
        process.exit(1);
    }

    // Load user's input
    // ToDo: Use stream API or readline API
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
                tree['keys'] = config.useFirstColumnAsCircleRadius ?
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
                    'value': config.useFirstColumnAsCircleRadius ?
                        floatItem[0] :
                        0.0,
                    'values': config.useFirstColumnAsCircleRadius ?
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

    const funcTree = (new FuncTree(tree, config))
        .init()
        .mapping(data)
        .visualize(document);

    // Output visualization to args.output
    let content;
    if (args.format === 'png') {
       const buffer = document.getElementById(config.targetElementId).innerHTML + '\n';
       content = svg2png.sync(buffer);
    } else if (args.format === 'svg') {
        content = document.getElementById(config.targetElementId).innerHTML + '\n';
    } else if (args.format === 'html') {
        content = jsdom.serializeDocument(document) + '\n';
    }

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
