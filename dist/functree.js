'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _d2 = require('d3');

var _d3 = _interopRequireDefault(_d2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.main = function (window, ref, config) {

    var diameter = config.functree.attribute.diameter;
    var tree = _d3.default.layout.tree().size([360, diameter / 2 - 120]);
    var nodes = tree.nodes(ref);
    var links = tree.links(nodes);

    init_image(window, config);
    update_rings(window, config, nodes);
    update_links(window, config, nodes, links, ref);
    update_nodes(window, config, nodes, ref);
    update_charts(window, config, nodes, ref);
};

var init_image = function init_image(window, config) {
    var width = config.functree.attribute.width;
    var height = config.functree.attribute.height;

    var svg = _d3.default.select(window.document.body).select('#' + config.target_id).append('svg').attr({
        'xmlns': 'http://www.w3.org/2000/svg',
        'version': '1.1',
        'width': width,
        'height': height
    });

    var buffer = svg.append('g').attr({
        'id': 'buffer',
        'transform': 'translate(' + width / 2 + ',' + height / 2 + '),scale(1)'
    });

    var rings = buffer.append('g').attr({
        'id': 'rings'
    });

    var links = buffer.append('g').attr({
        'id': 'links'
    });

    var nodes = buffer.append('g').attr({
        'id': 'nodes'
    });

    var charts = buffer.append('g').attr({
        'id': 'charts'
    });
};

var update_rings = function update_rings(window, config, nodes) {

    var diameter = config.functree.attribute.diameter;

    var max = _d3.default.max(_underscore2.default.pluck(nodes, 'depth'));
    var ring = _d3.default.select(window.document.body).select('#rings').selectAll('circle').data(_d3.default.range(1, max, 2));

    var enter = ring.enter().append('circle').attr({
        'fill': 'none',
        'r': function r(d) {
            return (diameter / 2 - 120) / max * (d + 0.5);
        },
        'stroke': '#f8f8f8',
        'stroke-width': (diameter / 2 - 120) / max // 0
    });
};

var update_links = function update_links(window, config, nodes, links, source) {

    var diagonal = _d3.default.svg.diagonal.radial().projection(function (d) {
        return [d.y, d.x / 180 * Math.PI];
    });
    var straight = function straight(d) {
        var x = function x(d) {
            return d.y * Math.cos((d.x - 90) / 180 * Math.PI);
        };
        var y = function y(d) {
            return d.y * Math.sin((d.x - 90) / 180 * Math.PI);
        };
        return 'M' + x(d.source) + ',' + y(d.source) + 'L' + x(d.target) + ',' + y(d.target);
    };
    var link = _d3.default.select(window.document.body).select('#links').selectAll('path').data(links, function (d) {
        return d.target.id;
    });

    var enter = link.enter().append('path').attr({
        'fill': 'none',
        'stroke': '#999',
        'stroke-width': 0.3,
        'stroke-dasharray': function strokeDasharray(d) {
            if (d.source.depth === 0) {
                return '3,3';
            }
        },
        'd': function d(_d) {
            if (_d.source.depth === 0) {
                return straight(_d);
            } else {
                return diagonal(_d);
            }
        }
    });
};

var update_nodes = function update_nodes(window, config, nodes, source) {

    var node = _d3.default.select(window.document.body).select('#nodes').selectAll('circle').data(nodes, function (d) {
        return d.id;
    });

    var enter = node.enter().append('circle').attr({
        'transform': function transform(d) {
            return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
        },
        'r': 0.5,
        'fill': function fill(d) {
            return d._children ? '#ddd' : '#fff';
        },
        'stroke': '#999',
        'stroke-width': 0.3,
        'cursor': 'pointer',
        'data-toggle': 'tooltip',
        'data-original-title': function dataOriginalTitle(d) {
            return d.name + ': ' + d.label;
        }
    });
};

var update_charts = function update_charts(window, config, nodes, source) {

    var chart = _d3.default.select(window.document.body).select('#charts').selectAll('g').data(nodes, function (d) {
        return d.id;
    });

    var get_max = _underscore2.default.memoize(function (depth) {
        return _underscore2.default.chain(nodes).filter(function (i) {
            return i.depth === depth;
        }).pluck('value').max().value();
    });

    var chart_enter = chart.enter().append('g').attr({
        'transform': function transform(d) {
            return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
        }
    });

    var circle = chart.selectAll('circle').data(function (d) {
        return [d];
    });

    var circle_enter = circle.enter().append('circle').attr({
        'r': function r(d) {
            var max = get_max(d.depth);
            return config.functree.normalize_circle ? d.value / max * 30 : d.value;
        },
        'fill': function fill(d) {
            return d.color;
        },
        'opacity': 0.8,
        'data-toggle': 'tooltip',
        'data-original-title': function dataOriginalTitle(d) {
            return d.name + ': ' + d.label;
        }
    });

    // let bar = chart
    //     .selectAll('rect')
    //     .data((d) => {
    //         return d.values;
    //     });

    // let bar_enter = bar
    //     .enter()
    //     .append('rect')
    //     .attr({
    //         'x': (d, i) => {
    //             console.log(this);
    //             return;
    //             let values = this.parentNode.__data__.values;
    //             let sum = d3.sum(values);
    //             let subsum = d3.sum(i === 0 ? [] : values.slice(0, i) );
    //             let opened = d3.max(_.pluck(nodes, 'depth'));
    //             let height = (diameter / 2 - 120) / opened * 0.95;
    //             return height / sum * subsum;
    //         },
    //         'y': () => {
    //             let depth = this.parentNode.__data__.depth;
    //             let opened = d3.max(_.pluck(nodes, 'depth'));
    //             // return - (parseInt((5 - depth) / 2) + 1);
    //             return - parseInt((opened / depth) / 2);
    //         },
    //         'width': (d) => {
    //             let values = this.parentNode.__data__.values;
    //             let sum = d3.sum(values);
    //             let opened = d3.max(_.pluck(nodes, 'depth'));
    //             let height = (diameter / 2 - 120) / opened * 0.95;
    //             return height / sum * d
    //         },
    //         'height': () => {
    //             var depth = this.parentNode.__data__.depth;
    //             let opened = d3.max(_.pluck(nodes, 'depth'));
    //             return parseInt((opened / depth) / 2) * 2;
    //         },
    //         'fill': (d, i) => {
    //             // return color.chart(i);
    //         },
    //         'data-toggle': 'tooltip',
    //         'data-original-title': function(d, i) {
    //             var name = this.parentNode.__data__.name;
    //             var label = this.parentNode.__data__.label;
    //             return name + ': ' + label;;
    //         }
    // });
};