'use strict'

import _ from 'underscore';
import d3 from 'd3';


// return list including all nodes
module.exports.get_nodes = (d, nodes=[]) => {

    nodes.push(d);

    _.each(d.children || d._children, (i) => {
        module.exports.get_nodes(i, nodes);
    });

    return nodes;
};


module.exports.init_nodes = (nodes, config) => {

    let color = d3.scale.category20();

    _.each(nodes, (i) => {
        i.value = 0;
        i.values = [];
        i.keys = [];
        i.color = color(i.depth);

        if (config.functree.show_all_nodes) {
            return false;
        }

        if (i.name.match(/M\d{5}|EPM\d{4}|Undefined MODULE/)) {
            i._children = i.children;
            i.children = null;
        }

    });
};


module.exports.set_values = (nodes, data, config) => {

    _.each(data, (i) => {
        if (i.name.match('Root')) {
            return false;
        }

        let match = _.find(nodes, (j) => {
            return i.name === j.name;
        });
        _.extend(match, i);
    });
};