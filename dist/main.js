'use strict';

var _templateObject = _taggedTemplateLiteral(['\n   _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___\n  |  ___| | | |  | |/ ___|_   _|  _ | ____| ____|     / ___| |   |_ _|\n  | |_  | | | |  | | |     | | | |_) |  _| |  _| _____| |   | |    | |\n  |  _| | |_| | |  | |___  | | |  _ <| |___| |__|_____| |___| |___ | |\n  |_|    ___/|_| _|____| |_| |_| ______|_____|     ____|_____|___|\n\n[ Visualization and analysis tool for omics data based on biological functional tree ]\n\nCopyright (c) 2014-2016 Kurokawa Nakashima Yamada Lab, Tokyo Institute of Technology.\n'], ['\n   _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___\n  |  ___| | | | \\ | |/ ___|_   _|  _ \\| ____| ____|     / ___| |   |_ _|\n  | |_  | | | |  \\| | |     | | | |_) |  _| |  _| _____| |   | |    | |\n  |  _| | |_| | |\\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | |\n  |_|    \\___/|_| \\_|\\____| |_| |_| \\_\\_____|_____|     \\____|_____|___|\n\n[ Visualization and analysis tool for omics data based on biological functional tree ]\n\nCopyright (c) 2014-2016 Kurokawa Nakashima Yamada Lab, Tokyo Institute of Technology.\n']),
    _templateObject2 = _taggedTemplateLiteral(['\nFor more information, see below:\n  https://github.com/yyuuta88/functree-cli/\n  http://www.bioviz.tokyo/functree2/'], ['\nFor more information, see below:\n  https://github.com/yyuuta88/functree-cli/\n  http://www.bioviz.tokyo/functree2/']);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _fileIo = require('./file-io.js');

var _fileIo2 = _interopRequireDefault(_fileIo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

(function () {

    var splash = [String.raw(_templateObject), String.raw(_templateObject2)];

    var args = _yargs2.default
    // .detectLocale(false)
    .command(require('./get.js')).command(require('./stats.js')).command(require('./create.js')).option({
        'show-config': {
            'type': 'boolean',
            'describe': 'Show default configuration value'
        }
    }).help().version().usage(splash[0]).epilogue(splash[1]).argv;

    if (args.showConfig) {

        var str = _fileIo2.default.read(_path2.default.join(__dirname, '../config/config.json'));
        process.stdout.write(str);
        process.exit(0);
    } else {

        _yargs2.default.showHelp('log');
        process.exit(1);
    }
})();