'use strict'

import fs from 'fs';
import process from 'process';
import _ from 'underscore';


module.exports.load_template = (fpath) => {

    try {
        let fd = fs.readFileSync(fpath);
        let data = fd.toString();

        return data;
    }

    catch(e) {
        process.stderr.write('File I/O Error: "' + fpath + '"\n');
        process.exit(1);
    }

};


module.exports.load_ref = 
module.exports.load_config = (fpath) => {

    try {
        let fd = fs.readFileSync(fpath);
        let str = fd.toString();
        let data = JSON.parse(str);

        return data;
    }

    catch(e) {
        process.stderr.write('File I/O Error: "' + fpath + '"\n');
        process.exit(1);
    }

};


module.exports.read_input = (fpath) => {

    try {
        let fd = fs.readFileSync(fpath);
        let str = fd.toString();
        let data = [];

        for (let line of str.split('\n')) {

            if (line.match('#') || line === '') {
                continue
            }

            try {
                let item = line.split('\t');
                let d = {
                    'name': item[0],
                    'value': parseFloat(item[1]),
                    'values': _.map(item.slice(2), (i) => {
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
        // process.exit(1);
    }

};