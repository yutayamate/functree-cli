'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _svg2png = require('svg2png');

var _svg2png2 = _interopRequireDefault(_svg2png);

var _util = require('./util.js');

var _util2 = _interopRequireDefault(_util);

var _functree = require('./functree.js');

var _functree2 = _interopRequireDefault(_functree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

module.exports.handler = function (args) {
    // Load configuration
    var config = {};
    var configPath = _path2.default.resolve(args.config || _path2.default.join(__dirname, '../config/config.json'));
    try {
        var configString = _fs2.default.readFileSync(configPath);
        try {
            config = JSON.parse(configString);
        } catch (e) {
            process.stderr.write('Error: Failed to parse JSON string "' + configPath + '"\n');
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write('Error: Failed to open file "' + configPath + '"\n');
        process.exit(1);
    }

    // Load tree structure data
    var tree = {};
    var treePath = _path2.default.resolve(args.tree);
    try {
        var treeString = _fs2.default.readFileSync(treePath);
        try {
            tree = JSON.parse(treeString);
        } catch (e) {
            process.stderr.write('Error: Failed to parse JSON string "' + treePath + '"\n');
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write('Error: Failed to open configuration file "' + treePath + '"\n');
        process.exit(1);
    }

    // Load template HTML and create window.document
    var document = null,
        window = null;
    var templateHTMLPath = _path2.default.resolve(_path2.default.join(__dirname, '../data/html/template.html'));
    try {
        var templateHTMLString = _fs2.default.readFileSync(templateHTMLPath);
        try {
            document = _jsdom2.default.jsdom(templateHTMLString);
            window = document.defaultView;
        } catch (e) {
            process.stderr.write('Error: Failed to parse HTML string "' + treePath + '"\n');
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write('Error: Failed to open template HTML file "' + treePath + '"\n');
        process.exit(1);
    }

    // Load user's input
    var data = [];
    var inputPath = _path2.default.resolve(args.input || '/dev/stdin');
    try {
        var fd = _fs2.default.readFileSync(inputPath);
        var inputString = fd.toString();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = inputString.split('\n')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var line = _step.value;

                if (line.match('#') || line === '') {
                    continue;
                }
                try {
                    var item = line.split('\t');
                    var d = {
                        'name': item[0],
                        'value': config.functree.use_1stcol_as_radius ? parseFloat(item[1]) : 0.0,
                        'values': item.slice(config.functree.use_1stcol_as_radius ? 2 : 1).map(function (i) {
                            return parseFloat(i);
                        })
                    };
                    data.push(d);
                } catch (e) {
                    // Not work well...
                    process.stderr.write('Warrning: Unexpeceted input type, skipped');
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    } catch (e) {
        process.stderr.write('Error: Filed to open file "' + inputPath + '"\n');
        process.exit(1);
    }

    var nodes = _util2.default.get_nodes(tree);
    tree.x0 = tree.y0 = 0;
    _util2.default.init_nodes(nodes, config);
    _util2.default.set_values(nodes, data, config);
    _functree2.default.main(window, tree, config);

    // Output visualization to args.output
    var content = void 0;
    if (args.format === 'svg') {
        content = document.getElementById(config.target_id).innerHTML + '\n';
    } else if (args.format === 'png') {
        var buffer = document.getElementById(config.target_id).innerHTML + '\n';
        content = _svg2png2.default.sync(buffer);
    } else if (args.format === 'html') {
        content = _jsdom2.default.serializeDocument(document) + '\n';
    }

    try {
        var stream = args.output ?
        // Output to file
        _fs2.default.createWriteStream(null, {
            'fd': _fs2.default.openSync(args.output, 'w')
        }) :
        // Output to stdout
        process.stdout;
        stream.write(content);
        process.exit(0);
    } catch (e) {
        process.stderr.write('Error: Filed to write to file "' + args.output + '"\n');
        process.exit(1);
    }
};