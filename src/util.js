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

    let color = (n) => {
        let scheme = config.color_scheme.category
            .map((i) => {
                return d3.rgb(i);
            });
        return scheme[n % scheme.length];
    };

    _.each(nodes, (i) => {
        i.value = 0;
        i.values = [];
        i.keys = [];
        i.color = color(i.depth);

        if (config.functree.show_all_nodes) {
            return false;
        }

        if (i.name.match(/md:M\d{5}|md:EPM\d{4}|Undefined MODULE/)) {
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

        // let match = _.find(nodes, (j) => {
        //     return i.name === j.name;
        // });
        // _.extend(match, i);

        let matches = _.filter(nodes, (j) => {
            return i.name === j.name;
        });

        _.each(matches, (j) => {
            if (j.depth < config.functree.disable_display_lower_than) {
                return false;
            }
            if (j.label.match('Undefined')) {
                return false;
            }
            _.extend(j, i);
        });
    });
};
