'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _d4 = require('d3');

var _d5 = _interopRequireDefault(_d4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getTreeLayout = _underscore2.default.memoize(function (diameter) {
    return _d5.default.layout.tree().size([360, diameter / 2 - 120]);
});

module.exports.initImage = function (window, config) {
    var width = config.user.attribute.width;
    var height = config.user.attribute.height;

    var svg = _d5.default.select(window.document.body).select('#ft-main').append('svg').attr({
        'xmlns': 'http://www.w3.org/2000/svg',
        'version': '1.1',
        'width': width,
        'height': height
    });

    var buffer = svg.append('g').attr({
        'id': 'ft-image-buffer',
        'transform': 'translate(' + width / 2 + ',' + height / 2 + '),scale(1)'
    });

    var legend = svg.append('g').attr({
        'id': 'ft-image-legend',
        'transform': 'translate(' + width + ')'
    });

    // svg.call(d3.behavior.zoom()
    //     .translate([width / 2, height / 2])
    //     .scaleExtent([0.5, 10])
    //     .on('zoom', function() {
    //         buffer.attr({
    //             'transform': 'translate(' + d3.event.translate + '),scale(' + d3.event.scale + ')'
    //         });
    //         // d3.select('#ft-box-scale').text(Math.floor(d3.event.scale * 100) + '%');
    //         // updateLegend();
    //         // updateLabels();
    //     })
    // );


    var rings = buffer.append('g').attr({
        'id': 'ft-image-rings'
    });

    var links = buffer.append('g').attr({
        'id': 'ft-image-links'
    });

    var nodes = buffer.append('g').attr({
        'id': 'ft-image-nodes'
    });

    var charts = buffer.append('g').attr({
        'id': 'ft-image-charts'
    });

    var labels = buffer.append('g').attr({
        'id': 'ft-image-labels'
    });

    // let captions = buffer.append('g')
    //     .attr({
    //         'id': 'ft-image-captions'
    //     });

    var legendBackground = legend.append('rect').attr({
        'width': 80,
        'height': 300,
        'x': -80 - 10,
        'y': 10,
        'fill': '#fff',
        'stroke': '#777',
        'stroke-width': 0.5
    });
};

module.exports.updateLegend = function (window, config) {
    _d5.default.select(window.document.body).select('#ft-image-legend').attr({
        'visibility': config.user.legend.scale ? 'visible' : 'hidden'
    });

    var scale = parseFloat(_d5.default.select(window.document.body).select('#ft-image-buffer').attr('transform').match(/\(.+?\)/g)[1].slice(1, -1));
    var data = _d5.default.range(30, 0, -10);
    var circles = _d5.default.select(window.document.body).select('#ft-image-legend').selectAll('circle').data(data);
    var texts = _d5.default.select(window.document.body).select('#ft-image-legend').selectAll('text').data(data);

    var circle = circles.enter().append('circle').attr({
        'cx': -10 - 80 / 2,
        'cy': function cy(d, i) {
            return i * 100 + 60;
        },
        'r': function r(d) {
            return d;
        },
        'fill': '#ddd'
    });

    var textEnter = texts.enter().append('text').attr({
        'x': -10 - 80 / 2,
        'y': function y(d, i) {
            return i * 100 + 60 + d + 20;
        },
        'font-size': 12,
        'font-family': 'sans-serif',
        'font-weight': 'bold',
        'text-anchor': 'middle',
        'fill': '#777'
    }).text(function (d) {
        return (d / scale).toFixed(1);
    });

    var textUpdate = texts.text(function (d) {
        return (d / scale).toFixed(1);
    });
};

module.exports.updateRings = function (window, config, root) {
    var diameter = config.user.attribute.diameter;

    var tree = getTreeLayout(diameter);
    var nodes = tree.nodes(root);
    var max = _d5.default.max(_underscore2.default.pluck(nodes, 'depth'));
    var ring = _d5.default.select(window.document.body).select('#ft-image-rings').selectAll('circle').data(_d5.default.range(1, max, 2));

    var ringEnter = ring.enter().append('circle').attr({
        'fill': 'none',
        'r': function r(d) {
            return (diameter / 2 - 120) / max * (d + 0.5);
        },
        'stroke': '#f8f8f8',
        // 'stroke-width': 0
        'stroke-width': (diameter / 2 - 120) / max // 0
    });

    var ringUpdate = ring.transition().duration(1000).attr({
        'r': function r(d) {
            return (diameter / 2 - 120) / max * (d + 0.5);
        },
        'stroke-width': (diameter / 2 - 120) / max
    });

    var ringExit = ring.exit().transition().duration(1000).attr({
        'stroke-width': 0
    }).remove();
};

module.exports.updateLinks = function (window, config, root, source) {
    var diameter = config.user.attribute.diameter;

    var tree = getTreeLayout(diameter);
    var nodes = tree.nodes(root);
    var links = tree.links(nodes);
    var diagonal = _d5.default.svg.diagonal.radial().projection(function (d) {
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
    var link = _d5.default.select(window.document.body).select('#ft-image-links').selectAll('path').data(links, function (d) {
        return d.target.id;
    });

    var linkEnter = link.enter().append('path').attr({
        'fill': 'none',
        'stroke': '#999',
        'stroke-width': 0.3,
        'stroke-dasharray': function strokeDasharray(d) {
            if (d.source.depth === 0) {
                return '3,3';
            }
        },
        // 'd': (d) => {
        //     let o = { 'x': source.x0, 'y': source.y0 };
        //     if (d.source.depth === 0) {
        //         return straight({ 'source': o, 'target': o });
        //     } else {
        //         return diagonal({ 'source': o, 'target': o });
        //     }
        // }
        'd': function d(_d) {
            if (_d.source.depth === 0) {
                return straight(_d);
            } else {
                return diagonal(_d);
            }
        }
    });
    // .on({
    //     'mouseover': (d) => {
    //         setColorLinks(d.target);
    //     },
    //     'mouseout': () => {
    //         d3.selectAll('path').attr({
    //             'style': null
    //         });
    //     }
    // });


    var linkUpdate = link.transition().duration(1000).attr({
        'd': function d(_d2) {
            if (_d2.source.depth === 0) {
                return straight(_d2);
            } else {
                return diagonal(_d2);
            }
        }
    });

    var linkExit = link.exit().transition().duration(1000).attr({
        'd': function d(_d3) {
            var o = { 'x': source.x, 'y': source.y };
            if (_d3.source.depth === 0) {
                return straight({ 'source': o, 'target': o });
            } else {
                return diagonal({ 'source': o, 'target': o });
            }
        }
    }).remove();
};

module.exports.updateNodes = function (window, config, root, source) {
    var diameter = config.user.attribute.diameter;

    var tree = getTreeLayout(diameter);
    var nodes = tree.nodes(root);
    var node = _d5.default.select(window.document.body).select('#ft-image-nodes').selectAll('circle').data(nodes, function (d) {
        return d.id;
    });

    var nodeEnter = node.enter().append('circle').attr({
        'r': 0.5,
        // 'fill': (d) => {
        //     return d._children ? '#ddd' : '#fff';
        // },
        'stroke': '#999',
        'stroke-width': 0.3,
        'cursor': 'pointer',
        // 'transform': (d) => {
        //     return 'rotate(' + (source.x0 - 90) + '),translate(' + source.y0 + ')';
        // },
        'data-toggle': 'tooltip',
        'data-original-title': function dataOriginalTitle(d) {
            return d.name + ': ' + d.label;
        },
        'fill': function fill(d) {
            return d._children ? '#ddd' : '#fff';
        },
        'transform': function transform(d) {
            return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
        }
    });
    // .on({
    //     'click': clickNode,
    //     'mouseover': (d) => {
    //         d3.select(this).style({
    //             'r': 10,
    //             'fill': '#000',
    //             'opacity': 0.5
    //         });
    //         setColorLinks(d);
    //         // setInformation(d);
    //         // setLinkToKEGG(d);
    //     },
    //     'mouseout': (d) => {
    //         d3.select(this).attr({
    //             'style': null
    //         });
    //         d3.selectAll('path').attr({
    //             'style': null
    //         });
    //     }
    // });


    var nodeUpdate = node.transition().duration(1000).attr({
        'fill': function fill(d) {
            return d._children ? '#ddd' : '#fff';
        },
        'transform': function transform(d) {
            return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
        }
    });

    var nodeExit = node.exit().transition().duration(1000).attr({
        'r': 0,
        'transform': function transform(d) {
            return 'rotate(' + (source.x - 90) + '),translate(' + source.y + ')';
        }
    }).remove();

    // $('[data-toggle="tooltip"]').tooltip({
    //     container: 'body',
    //     placement: 'top'
    // });
};

module.exports.updateCharts = function (window, config, root, source) {
    var diameter = config.user.attribute.diameter;

    var tree = getTreeLayout(diameter);
    var nodes = tree.nodes(root);
    var all = nodes;
    var chart = _d5.default.select(window.document.body).select('#ft-image-charts').selectAll('g').data(nodes, function (d) {
        return d.id;
    });

    // depthの中で最大の合計値を返す
    var getMax = _underscore2.default.memoize(function (depth) {
        var max = _underscore2.default.chain(all)
        // .filter((i) => {
        //     return i.depth === depth;
        // })
        .pluck('value').max().value();
        return max;
    });

    var getMaxForValues = _underscore2.default.memoize(function (depth) {
        var max = _underscore2.default.chain(all)
        // .filter((i) => {
        //     return i.depth === depth;
        // })
        .pluck('values').map(function (i) {
            return _d5.default.sum(i);
        }).max().value();
        return max;
    });

    var chartEnter = chart.enter().append('g').attr({
        // 'transform': (d) => {
        //     return 'rotate(' + (source.x0 - 90) + '),translate(' + source.y0 + ')';
        // }
        'transform': function transform(d) {
            return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
        }
    });
    // .on({
    //     // 'click': clickNode,
    //     'mouseover': function(d) {
    //         setColorLinks(d);
    //         // setInformation(d);
    //         // setLinkToKEGG(d);
    //     },
    //     'mouseout': function(d) {
    //         d3.selectAll('path').attr({
    //             'style': null
    //         });
    //     }
    // });


    var chartUpdate = chart.transition().duration(1000).attr({
        'transform': function transform(d) {
            return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
        }
    });

    var chartExit = chart.exit().transition().duration(1000).attr({
        'transform': function transform(d) {
            return 'rotate(' + (source.x - 90) + '),translate(' + source.y + ')';
        }
    }).remove();

    var circle = chart.selectAll('circle').data(function (d) {
        return [d];
    });

    var circleEnter = circle.enter().append('circle').attr({
        // 'r': function(d) {
        //     return 0;
        // },
        'r': function r(d) {
            var max = getMax(d.depth);
            return config.user.normalization.circle ? d.value / max * 30 : d.value;
        },
        'fill': function fill(d) {
            return d.color;
        },
        'opacity': 0.8,
        'data-toggle': 'tooltip',
        'data-original-title': function dataOriginalTitle(d) {
            return d.name + ': ' + d.value;
        }
    });
    // .on({
    //     'mouseover': () => {
    //         d3.select(this).style({
    //             'fill': '#000',
    //             'opacity': 0.5
    //         });

    //     },
    //     'mouseout': () => {
    //         d3.select(this).attr({
    //             'style': null
    //         });
    //     }
    // });


    var circleUpdate = circle.transition().duration(1000).attr({
        'r': function r(d) {
            var max = getMax(d.depth);
            return config.user.normalization.circle ? d.value / max * 30 : d.value;
        },
        'fill': function fill(d) {
            return d.color;
        },
        // 20160203: valueは可変なのでupdateにも記述が必要
        'data-toggle': 'tooltip',
        'data-original-title': function dataOriginalTitle(d) {
            return d.name + ': ' + d.value;
        }
    });

    var circleExit = circle.exit().transition().duration(1000).attr({
        'r': 0
    }).remove();

    /*
    var segment = chart.selectAll('rect')
        .data(function(d) {
            return d.values;
        });
      var segmentEnter = segment.enter().append('rect')
        .attr({
            // 'x': 0,
            'x': function(d, i) {
                // var values = this.parentNode.__data__.values;
                // var subsum = d3.sum(i === 0 ? [] : values.slice(0, i) );
                // var depth = this.parentNode.__data__.depth;
                // var max = getMaxForValues(depth);
                // var opened = d3.max(_.pluck(nodes, 'depth'));
                // var height = (diameter / 2 - 120) / opened * 0.95;
                // return config.user.normalize_bar_hight ? subsum / max * height : subsum;
                var values = this.parentNode.__data__.values;
                var sum = d3.sum(values);
                var subsum = d3.sum(i === 0 ? [] : values.slice(0, i) );
                var opened = d3.max(_.pluck(nodes, 'depth'));
                var height = (diameter / 2 - 120) / opened * 0.95;
                return height / sum * subsum;
            },
            // 'y': -1,
            'y': function() {
                var depth = this.parentNode.__data__.depth;
                return - (parseInt((5 - depth) / 2) + 1);
            },
            // 'height': 2,
            'height': function() {
                var depth = this.parentNode.__data__.depth;
                return (parseInt((5 - depth) / 2) + 1) * 2;
            },
            // 'width': 0,
            'width': function(d) {
                // var depth = this.parentNode.__data__.depth;
                // var max = getMaxForValues(depth);
                // var opened = d3.max(_.pluck(nodes, 'depth'));
                // var height = (diameter / 2 - 120) / opened * 0.95;
                // return config.user.normalize_bar_hight ? d / max * height : d;
                var values = this.parentNode.__data__.values;
                var sum = d3.sum(values);
                var opened = d3.max(_.pluck(nodes, 'depth'));
                var height = (diameter / 2 - 120) / opened * 0.95;
                return height / sum * d
             },
            'fill': function(d, i) {
                var key = this.parentNode.__data__.keys[i] || i;
                return color.chart(key);
            },
            'data-toggle': 'tooltip',
            'data-original-title': function(d, i) {
                var name = this.parentNode.__data__.name;
                var key = this.parentNode.__data__.keys[i] || i;
                return name + ' [' + key + ']: ' + d;
            }
        })
        // .on({
        //     'mouseover': function() {
        //         d3.select(this).style({
        //             'fill': '#000',
        //             'opacity': 0.5
        //         });
                
        //     },
        //     'mouseout': function() {
        //         d3.select(this).attr({
        //             'style': null
        //         });
        //     }
        // });
      var segmentUpdate = segment.transition().duration(1000)
        .attr({
            'x': function(d, i) {
                // var values = this.parentNode.__data__.values;
                // var subsum = d3.sum(i === 0 ? [] : values.slice(0, i) );
                // var depth = this.parentNode.__data__.depth;
                // var max = getMaxForValues(depth);
                // var opened = d3.max(_.pluck(nodes, 'depth'));
                // var height = (diameter / 2 - 120) / opened * 0.95;
                // return config.user.normalize_bar_hight ? subsum / max * height : subsum;
                var values = this.parentNode.__data__.values;
                var sum = d3.sum(values);
                var subsum = d3.sum(i === 0 ? [] : values.slice(0, i) );
                var opened = d3.max(_.pluck(nodes, 'depth'));
                var height = (diameter / 2 - 120) / opened * 0.95;
                return height / sum * subsum;
            },
            'width': function(d) {
                // var depth = this.parentNode.__data__.depth;
                // var max = getMaxForValues(depth);
                // var opened = d3.max(_.pluck(nodes, 'depth'));
                // var height = (diameter / 2 - 120) / opened * 0.95;
                // return config.user.normalize_bar_hight ? d / max * height : d;
                var values = this.parentNode.__data__.values;
                var sum = d3.sum(values);
                var opened = d3.max(_.pluck(nodes, 'depth'));
                var height = (diameter / 2 - 120) / opened * 0.95;
                return height / sum * d
             },
            // 20160203: key,nameは可変なのでupdateにも記述が必要
            'fill': function(d, i) {
                var key = this.parentNode.__data__.keys[i] || i;
                return color.chart(key);
            },
            'data-toggle': 'tooltip',
            'data-original-title': function(d, i) {
                var name = this.parentNode.__data__.name;
                var key = this.parentNode.__data__.keys[i] || i;
                return name + ' [' + key + ']: ' + d;
            }
        });
      var segmentExit = segment.exit().transition().duration(1000)
        .attr({
            'x': 0,
            'width': 0
        })
        .remove();
     */

    _underscore2.default.each(nodes, function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // $('[data-toggle="tooltip"]').tooltip({
    //     container: 'body',
    //     placement: 'top'
    // });
};