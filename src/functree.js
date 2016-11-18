'use strict'

import _ from 'underscore';
import d3 from 'd3';


module.exports.main = (window, ref, config) => {

    let diameter = config.functree.attribute.diameter;
    let tree = d3.layout.tree()
        .size([360, diameter / 2 - 120]);
    let nodes = tree.nodes(ref);
    let links = tree.links(nodes);

    init_image(window, config);
    update_rings(window, config, nodes);
    update_links(window, config, nodes, links, ref);
    update_nodes(window, config, nodes);
    update_charts(window, config, nodes);
    update_rounds(window, config, nodes);
    update_labels(window, config, nodes);

};


let init_image = (window, config) => {
    let width = config.functree.attribute.width;
    let height = config.functree.attribute.height;

    let svg = d3.select(window.document.body)
        .select('#' + config.target_id)
        .append('svg')
        .attr({
            'xmlns': 'http://www.w3.org/2000/svg',
            'version': '1.1',
            'width': width,
            'height': height
        });

    let buffer = svg.append('g')
        .attr({
            'id': 'buffer',
            'transform': 'translate(' + width / 2 + ',' + height / 2 + '),scale(1)'
        });

    let rings = buffer.append('g')
        .attr({
            'id': 'rings'
        });

    let links = buffer.append('g')
        .attr({
            'id': 'links'
        });

    let nodes = buffer.append('g')
        .attr({
            'id': 'nodes'
        });

    let charts = buffer.append('g')
        .attr({
            'id': 'charts'
        });

    let rounds = buffer.append('g')
        .attr({
            'id': 'rounds'
        });

    let labels = buffer.append('g')
        .attr({
            'id': 'labels'
        });

};


let update_rings = (window, config, nodes) => {

    let diameter = config.functree.attribute.diameter;

    let max = d3.max(_.pluck(nodes, 'depth'));
    let ring = d3.select(window.document.body)
        .select('#rings')
        .selectAll('circle')
        .data(d3.range(1, max, 2));

    let enter = ring
        .enter()
        .append('circle')
        .attr({
            'fill': 'none',
            'r': (d) => {
                return (diameter / 2 - 120) / max * (d + 0.5) || 0
            },
            'stroke': '#f8f8f8',
            'stroke-width': (diameter / 2 - 120) / max || 0
        });

};


let update_links = (window, config, nodes, links, source) => {

    let diagonal = d3.svg.diagonal.radial()
        .projection((d) => {
            return [d.y, d.x / 180 * Math.PI];
        });
    let straight = (d) => {
        let x = (d) => { return d.y * Math.cos((d.x - 90) / 180 * Math.PI); };
        let y = (d) => { return d.y * Math.sin((d.x - 90) / 180 * Math.PI); };
        return 'M' + x(d.source) + ',' + y(d.source) + 'L' + x(d.target) + ',' + y(d.target);
    };
    let link = d3.select(window.document.body)
        .select('#links')
        .selectAll('path')
        .data(links, (d) => {
            return d.target.id;
        });


    let enter = link.enter().append('path')
        .attr({
            'fill': 'none',
            'stroke': '#999',
            'stroke-width': 0.3,
            'stroke-dasharray': (d) => {
                if (d.source.depth === 0) {
                    return '3,3';
                }
            },
            'd': (d) => {
                if (d.source.depth === 0) {
                    return straight(d);
                } else {
                    return diagonal(d);
                }
            }
        });

};


let update_nodes = (window, config, nodes) => {

    let node = d3.select(window.document.body)
        .select('#nodes')
        .selectAll('circle')
        .data(nodes, (d) => {
            return d.id;
        });

    let enter = node
        .enter()
        .append('circle')
        .attr({
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            },
            'r': 0.5,
            'fill': (d) => {
                return d._children ? '#ddd' : '#fff';
            },
            'stroke': '#999',
            'stroke-width': 0.3,
            'cursor': 'pointer',
            'data-toggle': 'tooltip',
            'data-original-title': (d) => {
                return d.name + ': ' + d.label;
            }
        });

};


let update_charts = (window, config, nodes) => {

    if (config.functree.disable_display_charts) {
        return;
    }

    let diameter = config.functree.attribute.diameter;

    let get_max = (depth, varname) => {
        return _.chain(nodes)
            .filter((i) => {
                return i.depth === depth;
            })
            .pluck(varname)
            .map((i) => {
                return typeof i === 'object' ? d3.sum(i) : i;
            })
            .max()
            .value();
    };

    let get_max2 = (depth, varname) => {
        return _.chain(nodes)
            .filter((i) => {
                return i.depth === depth;
            })
            .pluck(varname)
            .map((i) => {
                return typeof i === 'object' ? d3.max(i) : i;
            })
            .max()
            .value();
    };

    let color = {
        'category': d3.scale.category20(),
        'linear': (value, depth) => {
            let max = get_max2(depth, 'values');
            let scheme = config.color_scheme.linear;
            return d3.scale.linear()
                .domain([0, max])
                .range(scheme.map((i) => {
                    return d3.rgb(i);
                }))(value);
        }
    };

    let chart = d3.select(window.document.body)
        .select('#charts')
        .selectAll('g')
        .data(nodes, (d) => {
            return d.id;
        });

    let chart_enter = chart
        .enter()
        .append('g')
        .attr({
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            }
        });

    let rect = chart
        .selectAll('rect')
        .data((d) => {
            return d.values;
        });

    let rect_enter = rect
        .enter()
        .append('rect')
        .attr({
            'x': function(d, i) {
                let values = this.parentNode.__data__.values;
                let sum = d3.sum(values);   // for stacked-100
                let subsum = d3.sum(i === 0 ? [] : values.slice(0, i));
                let opened = d3.max(_.pluck(nodes, 'depth'));
                let height = (diameter / 2 - 120) / opened * 0.80;
                let depth = this.parentNode.__data__.depth;
                let max = get_max(depth, 'values');

                switch (config.functree.style) {
                    case 'stacked':
                        return config.functree.enable_normalize_charts ? (subsum / max * height || 0) : subsum;
                    case 'stacked-100':
                        return height / sum * subsum;
                    case 'heatmap':
                        return height / values.length * i;
                }

            },
            'y': function() {
                let depth = this.parentNode.__data__.depth;
                let opened = d3.max(_.pluck(nodes, 'depth'));
                return - (2 + (opened - depth) / opened * 3) / 2;
            },
            'width': function(d) {
                let values = this.parentNode.__data__.values;
                let sum = d3.sum(values);   // for stacked-100
                let opened = d3.max(_.pluck(nodes, 'depth'));
                let height = (diameter / 2 - 120) / opened * 0.80;
                let depth = this.parentNode.__data__.depth;
                let max = get_max(depth, 'values');

                switch (config.functree.style) {
                    case 'stacked':
                        return config.functree.enable_normalize_charts ? (d / max * height || 0) : d;
                    case 'stacked-100':
                        return height / sum * d;
                    case 'heatmap':
                        return height / values.length;
                }

            },
            'height': function() {
                let depth = this.parentNode.__data__.depth;
                let opened = d3.max(_.pluck(nodes, 'depth'));
                return 2 + (opened - depth) / opened * 3;
            },
            'fill': function(d, i) {
                let depth = this.parentNode.__data__.depth;

                switch (config.functree.style) {
                    case 'stacked':
                        return color.category(i);
                    case 'stacked-100':
                        return color.category(i);
                    case 'heatmap':
                        return color.linear(d, depth);
                }
            },
            'data-toggle': 'tooltip',
            'data-original-title': function(d, i) {
                let name = this.parentNode.__data__.name;
                let label = this.parentNode.__data__.label;
                return name + ': ' + label;
            }
        });
};


let update_rounds = (window, config, nodes) => {

    if (config.functree.disable_display_rounds) {
        return;
    }

    let get_max = (depth, varname) => {
        return _.chain(nodes)
            .filter((i) => {
                return i.depth === depth;
            })
            .pluck(varname)
            .map((i) => {
                return typeof i === 'object' ? d3.sum(i) : i;
            })
            .max()
            .value();
    };

    let circle = d3.select(window.document.body)
        .select('#rounds')
        .selectAll('circle')
        .data(nodes, (d) => {
            return d.id;
        });

    let enter = circle
        .enter()
        .append('circle')
        .attr({
            'r': (d) => {
                let max = get_max(d.depth, 'value');
                return config.functree.enable_normalize_rounds ? (d.value / max * 20 || 0) : d.value;
            },
            'fill': (d) => {
                return d.color;
            },
            // 'stroke': (d) => {
            //     return d3.rgb(d.color).darker();
            // },
            'stroke': '#fff',
            'stroke-width': (d) => {
                return 0.5;
            },
            'opacity': 0.4,
            'data-toggle': 'tooltip',
            'data-original-title': (d) => {
                return d.name + ': ' + d.label;
            },
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            }
        });
};

let update_labels = (window, config, nodes) => {

    let range_check = (d, config, nodes) => {
        let filtered = _.chain(nodes)
            .filter((b) => {
                return d.depth === b.depth && b.value > 0.0;
            })
            .sortBy('value')
            .value();
        let index = _.sortedIndex(filtered, d, 'value');
        let threshold = config.threshold;
        return index > Math.floor(filtered.length * (1 - threshold));
    };

    let filtered = nodes
        .filter((d) => {
            let layer_c = (d.depth === 1);
            let range_c = range_check(d, config, nodes);
            let undefined_c = d.label.match('Undefined');
            return (layer_c || range_c) && !undefined_c;
        });

    let label = d3.select(window.document.body)
        .select('#labels')
        .selectAll('text')
        .data(filtered, (d) => {
            return d.id;
        });

    let enter = label
        .enter()
        .append('text')
        .attr({
            'y': -10 / 2,
            'font-family': 'Helvetica',
            'font-size': 10,
            'text-anchor': 'middle',
            'fill': '#555',
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + '),rotate(' + (90 - d.x) + ')';
            }
        })
        .text((d) => {
            let attr_name = config.functree.label_data;
            let label = eval('d.' + attr_name);
            let substr = label.replace(/ \[.*\]/, '').split(', ')[0];
            return substr;
        });
};
