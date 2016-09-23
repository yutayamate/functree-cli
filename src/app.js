#!/usr/bin/env node

'use strict'

import yargs from 'yargs';


let splash = [
String.raw`
 _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___ 
|  ___| | | | \ | |/ ___|_   _|  _ \| ____| ____|     / ___| |   |_ _|
| |_  | | | |  \| | |     | | | |_) |  _| |  _| _____| |   | |    | | 
|  _| | |_| | |\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | | 
|_|    \___/|_| \_|\____| |_| |_| \_\_____|_____|     \____|_____|___|
                                                                      
[ A Command-line based visualization tool for massive-scale omics data ]

Copyright (c) 2014-2016 Kurokawa Nakashima Yamada Lab, Tokyo Institute of Technology. All Rights Reserved.
`,

String.raw`
For more information, please see below:
  http://wwww.bioviz.tokyo/functree`
];


let args = yargs.detectLocale(false)
    .command(require('./create.js'))
    .command(require('./stats.js'))
    .help()
    .version()
    .usage(splash[0])
    .epilogue(splash[1])
    .argv;

yargs.showHelp('log');

process.exit(1);