'use strict'

import _ from 'underscore';


module.exports.parseArgsAndConfigFileObj = (args, configFileObj) => {

    let config = {
        'default': JSON.parse(configFileObj),
        'user': null
    };
    config.user = _.clone(config.default, true);

    return config;
};


module.exports.parseInputFileObj = (inputFileObj, config) => {

    let data = [];
    let inputStr = inputFileObj.toString();

    for (let line of inputStr.split('\n')) {

        if (line.match('#') || line === '') {
            continue
        }

        let item = line.split('\t');
        data.push({
            'name': item[0],
            'value': parseFloat(item[1]),
            'values': _.map(item.slice(2), (i) => { return parseFloat(i); })
        });
    }

    return data;
};