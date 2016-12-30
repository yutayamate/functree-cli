'use strict'

import path from 'path';
import yargs from 'yargs';
import file_io from './file-io.js';


(() => {

    let splash = [
String.raw`
     _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___
    |  ___| | | | \ | |/ ___|_   _|  _ \| ____| ____|     / ___| |   |_ _|
    | |_  | | | |  \| | |     | | | |_) |  _| |  _| _____| |   | |    | |
    |  _| | |_| | |\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | |
    |_|    \___/|_| \_|\____| |_| |_| \_\_____|_____|     \____|_____|___|

[ Visualization and analysis tool for omics data based on Biological Functional Tree ]

Copyright (c) 2014-2016 Kurokawa Nakashima Yamada Lab, Tokyo Institute of Technology.
`,

String.raw`
For more information, see below:
  http://www.bioviz.tokyo/functree`
    ];


    let args = yargs
        .detectLocale(false)
        .command(require('./get.js'))
        .command(require('./stats.js'))
        .command(require('./create.js'))
        .option({
            'show-config': {
                'type': 'boolean',
                'describe': 'Show default configuration'
            }
        })
        .help()
        .version()
        .usage(splash[0])
        .epilogue(splash[1])
        .argv;


    if (args.showConfig) {

        let str = file_io.read(path.join(__dirname, '../config/config.json'));
        process.stdout.write(str);
        process.exit(0);

    } else {

        yargs.showHelp('log');
        process.exit(1);

    }

})();
