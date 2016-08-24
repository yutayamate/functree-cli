'use strict'

import fs from 'fs';
import process from 'process';
import _ from 'underscore';


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
                    'values': _.map(item.slice(2), (i) => { return parseFloat(i); })
                };
                data.push(d);
            }

            catch(e) {
                process.stderr.write('Unexpeceted input type: skipped')
            }

        }
        return data;
    }

    catch(e) {
        process.stderr.write('File i/o error: "' + fpath + '"\n');
        process.exit(1);
    }

};