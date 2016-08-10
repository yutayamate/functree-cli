'use strict'

import _ from 'underscore';
import d3 from 'd3';


// return array obj including all nodes
let getAllNodes = (d, nodes=[]) => {

    nodes.push(d);

    _.each(d.children || d._children, (i) => {
        getAllNodes(i, nodes);
    });

    return nodes;
};


module.exports.initTree = (tree, config) => {

    let all = getAllNodes(tree);

    _.each(all, (i) => {
        i.value = 0;
        i.values = [];
        i.keys = [];

        // if you use tree of KEGG, uncomment below lines to hide KO nodes
        // if (i.depth == 4) {
        //     i.children = i._children;
        //     i.children = null;
        // }
    });
};


module.exports.setValues = (tree, config, data) => {

    let all = getAllNodes(tree);

    _.each(data, (i) => {
        let match = _.find(all, (j) => {
            return i['name'] === j['name'];
        });
        _.extend(match, i);
    });
};