#!/usr/bin/env node


'use strict';

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_yargs2.default.detectLocale(false).command(require('./create.js')).help().version().usage('\n' + ' _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___ \n' + '|  ___| | | | \\ | |/ ___|_   _|  _ \\| ____| ____|     / ___| |   |_ _|\n' + '| |_  | | | |  \\| | |     | | | |_) |  _| |  _| _____| |   | |    | | \n' + '|  _| | |_| | |\\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | | \n' + '|_|    \\___/|_| \\_|\\____| |_| |_| \\_\\_____|_____|     \\____|_____|___|\n' + '                                                                      \n' + '[ A Command-line based visualization tool for massive-scale omics data ]\n').epilogue('For more information, please see below:\n' + '  http://wwww.bioviz.tokyo/functree2').argv;

_yargs2.default.showHelp('log');

process.exit(1);