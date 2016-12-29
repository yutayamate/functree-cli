'use strict'

import fs from 'fs';
import process from 'process';
import _ from 'underscore';


module.exports.read = (fpath) => {

    try {
        let fd = fs.readFileSync(fpath);
        let str = fd.toString();

        return str;
    }

    catch(e) {
        process.stderr.write('File I/O Error: "' + fpath + '"\n');
        process.exit(1);
    }

};


module.exports.write = (fpath, str) => {

    try {
        let fd = fs.openSync(fpath, 'w');
        fs.writeSync(fd, str);
    }

    catch(e) {
        process.stderr.write('File I/O Error: "' + fpath + '"\n');
        process.exit(1);
    }

};


module.exports.load_ref =
module.exports.load_config = (fpath) => {

    try {
        let str = module.exports.read(fpath);
        let data = JSON.parse(str);

        return data;
    }

    catch(e) {
        process.stderr.write('Invalid JSON Error: "' + fpath + '"\n');
        process.exit(1);
    }

};


module.exports.read_input = (fpath, config) => {

    let str = module.exports.read(fpath);
    let data = [];

    for (let line of str.split('\n')) {

        if (line.match('#') || line === '') {
            continue
        }

        try {
            let item = line.split('\t');
            let d = {
                'name': item[0],
                'value': config.functree.use_1stcol_as_radius ? parseFloat(item[1]) : 0.0,
                'values': _.map(item.slice(config.functree.use_1stcol_as_radius ? 2 : 1), (i) => {
                    return parseFloat(i);
                })
            };

            data.push(d);
        }

        catch(e) {
            // うまくcatchしない?
            process.stderr.write('Unexpeceted input type: skipped')
        }

    }
    return data;

};
