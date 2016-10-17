'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

    var svg = _d3.default.select(window.document.body).select('#main').append('svg').attr({
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
            return (diameter / 2 - 120) / max * (d + 0.5) || 0;
        },
        'stroke': '#f8f8f8',
        'stroke-width': (diameter / 2 - 120) / max || 0
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

    var diameter = config.functree.attribute.diameter;

    var get_max = function get_max(depth, varname) {
        return _underscore2.default.chain(nodes).filter(function (i) {
            return i.depth === depth;
        }).pluck(varname).map(function (i) {
            return (typeof i === 'undefined' ? 'undefined' : _typeof(i)) === 'object' ? _d3.default.sum(i) : i;
        }).max().value();
    };

    // todo: integrate with get_max()
    var get_max2 = function get_max2(depth, varname) {
        return _underscore2.default.chain(nodes).filter(function (i) {
            return i.depth === depth;
        }).pluck(varname).map(function (i) {
            return (typeof i === 'undefined' ? 'undefined' : _typeof(i)) === 'object' ? _d3.default.max(i) : i;
        }).max().value();
    };

    var color = {
        'category': _d3.default.scale.category20(),
        'linear': function linear(value, depth) {
            var max = get_max2(depth, 'values');
            var scheme = config.color_scheme.linear;
            return _d3.default.scale.linear().domain([0, max]).range(scheme.map(function (i) {
                return _d3.default.rgb(i);
            }))(value);
        }
    };

    var bar = _d3.default.select(window.document.body).select('#charts').selectAll('g').data(nodes, function (d) {
        return d.id;
    });

    var bar_enter = bar.enter().append('g').attr({
        'transform': function transform(d) {
            return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
        }
    });

    var rect = bar.selectAll('rect').data(function (d) {
        return d.values;
    });

    var rect_enter = rect.enter().append('rect').attr({
        'x': function x(d, i) {
            var values = this.parentNode.__data__.values;
            var sum = _d3.default.sum(values); // stack100
            var subsum = _d3.default.sum(i === 0 ? [] : values.slice(0, i));
            var opened = _d3.default.max(_underscore2.default.pluck(nodes, 'depth'));
            var height = (diameter / 2 - 120) / opened * 0.80;
            var depth = this.parentNode.__data__.depth;
            var max = get_max(depth, 'values');

            switch (config.functree.style) {
                case 'stacked':
                    return config.functree.normalize_bar ? subsum / max * height || 0 : subsum;
                case 'stacked-100':
                    return height / sum * subsum;
                case 'heatmap':
                    return height / values.length * i;
            }
        },
        'y': function y() {
            var depth = this.parentNode.__data__.depth;
            var opened = _d3.default.max(_underscore2.default.pluck(nodes, 'depth'));
            return -(2 + (opened - depth) / opened * 3) / 2;
        },
        'width': function width(d) {
            var values = this.parentNode.__data__.values;
            var sum = _d3.default.sum(values); // stack100
            var opened = _d3.default.max(_underscore2.default.pluck(nodes, 'depth'));
            var height = (diameter / 2 - 120) / opened * 0.80;
            var depth = this.parentNode.__data__.depth;
            var max = get_max(depth, 'values');

            switch (config.functree.style) {
                case 'stacked':
                    return config.functree.normalize_bar ? d / max * height || 0 : d;
                case 'stacked-100':
                    return height / sum * d;
                case 'heatmap':
                    return height / values.length;
            }
        },
        'height': function height() {
            var depth = this.parentNode.__data__.depth;
            var opened = _d3.default.max(_underscore2.default.pluck(nodes, 'depth'));
            return 2 + (opened - depth) / opened * 3;
        },
        'fill': function fill(d, i) {
            var depth = this.parentNode.__data__.depth;

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
        'data-original-title': function dataOriginalTitle(d, i) {
            var name = this.parentNode.__data__.name;
            var label = this.parentNode.__data__.label;
            return name + ': ' + label;;
        }
    });

    var circle = _d3.default.select(window.document.body).select('#charts').selectAll('circle').data(nodes, function (d) {
        return d.id;
    });

    var circle_enter = circle.enter().append('circle').attr({
        'r': function r(d) {
            var max = get_max(d.depth, 'value');
            return config.functree.normalize_circle ? d.value / max * 30 || 0 : d.value;
        },
        'fill': function fill(d) {
            return d.color;
        },
        'stroke': function stroke(d) {
            return _d3.default.rgb(d.color).darker();
        },
        'stroke-width': function strokeWidth(d) {
            return 0.5;
        },
        'opacity': 0.6,
        'data-toggle': 'tooltip',
        'data-original-title': function dataOriginalTitle(d) {
            return d.name + ': ' + d.label;
        },
        'transform': function transform(d) {
            return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
        }
    });
};

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