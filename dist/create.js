'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handler = exports.builder = exports.describe = exports.command = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _svg2png = require('svg2png');

var _svg2png2 = _interopRequireDefault(_svg2png);

var _functree = require('./functree.js');

var _functree2 = _interopRequireDefault(_functree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var command = exports.command = 'create [options...]';
var describe = exports.describe = 'Create visualization';

var builder = exports.builder = {
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

var handler = exports.handler = function handler(args) {
    // Load configuration
    var config = null;
    var configPath = _path2.default.resolve(args.config || _path2.default.join(__dirname, '../etc/config.json'));
    try {
        var configString = _fs2.default.readFileSync(configPath);
        try {
            config = JSON.parse(configString);
        } catch (e) {
            process.stderr.write(('Error: Failed to parse JSON string "' + configPath + '"\n').error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(('Error: Failed to open file "' + configPath + '"\n').error);
        process.exit(1);
    }

    // Load tree structure data
    var tree = null;
    var treePath = _path2.default.resolve(args.tree);
    try {
        var treeString = _fs2.default.readFileSync(treePath);
        try {
            tree = JSON.parse(treeString);
        } catch (e) {
            process.stderr.write(('Error: Failed to parse JSON string "' + treePath + '"\n').error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(('Error: Failed to open file "' + treePath + '"\n').error);
        process.exit(1);
    }

    // Load template HTML and create window.document
    var document = null,
        window = null;
    var templateHTMLPath = _path2.default.resolve(_path2.default.join(__dirname, '../templates/html/viewer.html'));
    try {
        var templateHTMLString = _fs2.default.readFileSync(templateHTMLPath);
        try {
            document = _jsdom2.default.jsdom(templateHTMLString);
            window = document.defaultView;
        } catch (e) {
            process.stderr.write(('Error: Failed to parse HTML string "' + treePath + '"\n').error);
            process.exit(1);
        }
    } catch (e) {
        process.stderr.write(('Error: Failed to open file "' + treePath + '"\n').error);
        process.exit(1);
    }

    // Load user's input
    var data = {};
    var inputPath = _path2.default.resolve(args.input || '/dev/stdin');
    try {
        var buffer = _fs2.default.readFileSync(inputPath);
        var lines = buffer.toString().split('\n');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var line = _step.value;

                // Skip header and empty line
                if (line.match(/^#/) || line === '') {
                    continue;
                }
                if (line.match(/^\t/)) {
                    var keys = line.trim().split('\t');
                    tree['keys'] = config.useFirstColumnAsCircleRadius ? keys.slice(1) : keys;
                    continue;
                }
                try {
                    var item = line.split('\t');
                    var name = item[0];
                    if (!(item.length > 1)) {
                        throw name;
                    }
                    var floatItem = item.slice(1).map(function (i) {
                        return parseFloat(i);
                    });
                    var d = {
                        'name': name,
                        'value': config.useFirstColumnAsCircleRadius ? floatItem[0] : 0.0,
                        'values': config.useFirstColumnAsCircleRadius ? floatItem.slice(1) : floatItem
                    };
                    data[name] = d;
                } catch (e) {
                    process.stderr.write(('Warning: Unexpeceted input line, skipped "' + e + '"\n').warn);
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
        process.stderr.write(('Error: Filed to open file "' + inputPath + '"\n').error);
        process.exit(1);
    }

    var funcTree = new _functree2.default(tree, config);

    // Re-define root node
    if (config.rootNodeName) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = funcTree.getNodes()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var i = _step2.value;

                if (i.name === config.rootNodeName) {
                    i.keys = tree.keys;
                    tree = i;
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        funcTree = new _functree2.default(tree, config);
    }

    // Create visualization
    funcTree.initialize().mapping(data).visualize(document);

    // Output visualization to args.output
    var content = void 0;
    if (args.format === 'png') {
        var _buffer = document.getElementById(config.targetElementId).innerHTML + '\n';
        content = _svg2png2.default.sync(_buffer);
    } else if (args.format === 'svg') {
        content = document.getElementById(config.targetElementId).innerHTML + '\n';
    } else if (args.format === 'html') {
        content = _jsdom2.default.serializeDocument(document) + '\n';
    }

    try {
        var stream = args.output ?
        // Output to file
        _fs2.default.createWriteStream(null, {
            'fd': _fs2.default.openSync(_path2.default.resolve(args.output), 'w')
        }) :
        // Output to stdout
        process.stdout;
        stream.write(content);
        process.exit(0);
    } catch (e) {
        process.stderr.write(('Error: Filed to write to file "' + _path2.default.resolve(args.output) + '"\n').error);
        process.exit(1);
    }
};