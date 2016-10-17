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
    update_nodes(window, config, nodes, ref);
    update_charts(window, config, nodes, ref);

};


let init_image = (window, config) => {
    let width = config.functree.attribute.width;
    let height = config.functree.attribute.height;

    let svg = d3.select(window.document.body)
        .select('#main')
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


let update_nodes = (window, config, nodes, source) => {

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


let update_charts = (window, config, nodes, source) => {

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

    // todo: integrate with get_max()
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

    let bar = d3.select(window.document.body)
        .select('#charts')
        .selectAll('g')
        .data(nodes, (d) => {
            return d.id;
        });

    let bar_enter = bar
        .enter()
        .append('g')
        .attr({
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            }
        });

    let rect = bar
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
                let sum = d3.sum(values);   // stack100
                let subsum = d3.sum(i === 0 ? [] : values.slice(0, i));
                let opened = d3.max(_.pluck(nodes, 'depth'));
                let height = (diameter / 2 - 120) / opened * 0.80;
                let depth = this.parentNode.__data__.depth;
                let max = get_max(depth, 'values');

                switch (config.functree.style) {
                    case 'stacked':
                        return config.functree.normalize_bar ? (subsum / max * height || 0) : subsum;
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
                let sum = d3.sum(values);   // stack100
                let opened = d3.max(_.pluck(nodes, 'depth'));
                let height = (diameter / 2 - 120) / opened * 0.80;
                let depth = this.parentNode.__data__.depth;
                let max = get_max(depth, 'values');

                switch (config.functree.style) {
                    case 'stacked':
                        return config.functree.normalize_bar ? (d / max * height || 0) : d;
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
                return name + ': ' + label;;
            }
    });

    let circle = d3.select(window.document.body)
        .select('#charts')
        .selectAll('circle')
        .data(nodes, (d) => {
            return d.id;
        });

    let circle_enter = circle
        .enter()
        .append('circle')
        .attr({
            'r': (d) => {
                let max = get_max(d.depth, 'value');
                return config.functree.normalize_circle ? (d.value / max * 30 || 0) : d.value;
            },
            'fill': (d) => {
                return d.color;
            },
            'stroke': (d) => {
                return d3.rgb(d.color).darker();
            },
            'stroke-width': (d) => {
                return 0.5;
            },
            'opacity': 0.6,
            'data-toggle': 'tooltip',
            'data-original-title': (d) => {
                return d.name + ': ' + d.label;
            },
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            }
        });

}

/* not consider the order of circles and charts
let update_charts = (window, config, nodes, source) => {

    let diameter = config.functree.attribute.diameter;

    let chart = d3.select(window.document.body)
        .select('#charts')
        .selectAll('g')
        .data(nodes, (d) => {
            return d.id;
        });

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

    // todo: integrate with get_max()
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
            let colorset = [
                "rgb(223,236,244)",
                "rgb(45,69,91)"
            ];
            return d3.scale.linear()
                .domain([0, max])
                .range(colorset.map((i) => {
                    return d3.rgb(i);
                }))(value);
        }
    };

    let chart_enter = chart
        .enter()
        .append('g')
        .attr({
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            }
        });

    let circle = chart
        .selectAll('circle')
        .data((d) => {
            return [d];
        });

    let circle_enter = circle
        .enter()
        .append('circle')
        .attr({
            'r': (d) => {
                let max = get_max(d.depth, 'value');
                return config.functree.normalize_circle ? (d.value / max * 30 || 0) : d.value;
            },
            'fill': (d) => {
                return d.color;
            },
            'stroke': (d) => {
                return d3.rgb(d.color).darker();
            },
            'stroke-width': (d) => {
                return 0.5;
            },
            'opacity': 0.6,
            'data-toggle': 'tooltip',
            'data-original-title': (d) => {
                return d.name + ': ' + d.label;
            }
        });


    let bar = chart
        .selectAll('rect')
        .data((d) => {
            return d.values;
        });

    let bar_enter = bar
        .enter()
        .append('rect')
        .attr({
            'x': function(d, i) {
                let values = this.parentNode.__data__.values;
                let sum = d3.sum(values);   // stack100
                let subsum = d3.sum(i === 0 ? [] : values.slice(0, i));
                let opened = d3.max(_.pluck(nodes, 'depth'));
                let height = (diameter / 2 - 120) / opened * 0.80;
                let depth = this.parentNode.__data__.depth;
                let max = get_max(depth, 'values');

                switch (config.functree.style) {
                    case 'stacked':
                        return config.functree.normalize_bar ? (subsum / max * height || 0) : subsum;
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
                let sum = d3.sum(values);   // stack100
                let opened = d3.max(_.pluck(nodes, 'depth'));
                let height = (diameter / 2 - 120) / opened * 0.80;
                let depth = this.parentNode.__data__.depth;
                let max = get_max(depth, 'values');

                switch (config.functree.style) {
                    case 'stacked':
                        return config.functree.normalize_bar ? (d / max * height || 0) : d;
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
                return name + ': ' + label;;
            }
    });

}
*/
