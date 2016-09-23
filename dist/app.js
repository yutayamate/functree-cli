#!/usr/bin/env node


'use strict';

var _templateObject = _taggedTemplateLiteral(['\n _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___ \n|  ___| | | |  | |/ ___|_   _|  _ | ____| ____|     / ___| |   |_ _|\n| |_  | | | |  | | |     | | | |_) |  _| |  _| _____| |   | |    | | \n|  _| | |_| | |  | |___  | | |  _ <| |___| |__|_____| |___| |___ | | \n|_|    ___/|_| _|____| |_| |_| ______|_____|     ____|_____|___|\n                                                                      \n[ A Command-line based visualization tool for massive-scale omics data ]\n\nCopyright (c) 2014-2016 Kurokawa Nakashima Yamada Lab, Tokyo Institute of Technology. All Rights Reserved.\n'], ['\n _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___ \n|  ___| | | | \\ | |/ ___|_   _|  _ \\| ____| ____|     / ___| |   |_ _|\n| |_  | | | |  \\| | |     | | | |_) |  _| |  _| _____| |   | |    | | \n|  _| | |_| | |\\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | | \n|_|    \\___/|_| \\_|\\____| |_| |_| \\_\\_____|_____|     \\____|_____|___|\n                                                                      \n[ A Command-line based visualization tool for massive-scale omics data ]\n\nCopyright (c) 2014-2016 Kurokawa Nakashima Yamada Lab, Tokyo Institute of Technology. All Rights Reserved.\n']),
    _templateObject2 = _taggedTemplateLiteral(['\nFor more information, please see below:\n  http://wwww.bioviz.tokyo/functree'], ['\nFor more information, please see below:\n  http://wwww.bioviz.tokyo/functree']);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var splash = [String.raw(_templateObject), String.raw(_templateObject2)];

var args = _yargs2.default.detectLocale(false).command(require('./create.js')).command(require('./stats.js')).help().version().usage(splash[0]).epilogue(splash[1]).argv;

_yargs2.default.showHelp('log');

process.exit(1);