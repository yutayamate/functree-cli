'use strict'

import fs from 'fs';
import path from 'path';
import colors from 'colors';
import yargs from 'yargs';

{
    colors.setTheme('colors/themes/generic-logging');
    const version = require('../package.json').version;
    const usageText= String.raw`
     _____ _   _ _   _  ____ _____ ____  _____ _____       ____ _     ___
    |  ___| | | | \ | |/ ___|_   _|  _ \| ____| ____|     / ___| |   |_ _|
    | |_  | | | |  \| | |     | | | |_) |  _| |  _| _____| |   | |    | |
    |  _| | |_| | |\  | |___  | | |  _ <| |___| |__|_____| |___| |___ | |
    |_|    \___/|_| \_|\____| |_| |_| \_\_____|_____|     \____|_____|___|

[ Visualization and analysis tool for omics data based on biological functional tree ]

Version: ${version}  Copyright (c) 2014-2017 Yamada Lab, Tokyo Institute of Technology.

Usage: functree [command] [options...]`;

    const epilogueText =
`For more information, see below:
  https://github.com/yyuuta88/functree-cli`;

    const args = yargs
        .detectLocale(false)
        .wrap(100)
        .command(require('./get.js'))
        .command(require('./stats.js'))
        .command(require('./create.js'))
        .option({
            'no-color': {
                'global': true,
                'type': 'boolean',
                'describe': 'Disable colored output'
            },
            'show-config': {
                'type': 'boolean',
                'describe': 'Show default configuration value'
            }
        })
        .help()
        .version()
        .usage(usageText)
        .epilogue(epilogueText)
        .argv;

    // If "--show-config" is supplied, show default configuration
    if (args.showConfig) {
        const configPath = path.resolve(path.join(__dirname, '../etc/config.json'));
        try {
            const configString = fs.readFileSync(configPath);
            process.stdout.write(configString);
            process.exit(0);
        } catch (e) {
            process.stderr.write(`Error: Failed to open file "${configPath}"\n`.error);
            process.exit(1);
        }
    // If the command is invalid, print error message
    } else if (args._[0]) {
        process.stderr.write(`Error: "${args._[0]}" is not a functree command\n`.error);
        process.exit(1)
    // If any option is not supplied, show help and usage
    } else {
        yargs.showHelp();
        process.exit(1);
    }
}
