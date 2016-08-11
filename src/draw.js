'use strict'

import _ from 'underscore';
import d3 from 'd3';


let getTreeLayout = _.memoize((diameter) => {
    return d3.layout.tree()
        .size([360, diameter / 2 - 120]);
});


module.exports.initImage = (window, config) => {
    let width = config.user.attribute.width;
    let height = config.user.attribute.height;

    let svg = d3.select(window.document.body).select('#ft-main')
        .append('svg')
        .attr({
            'xmlns': 'http://www.w3.org/2000/svg',
            'version': '1.1',
            'width': width,
            'height': height
        });

    let buffer = svg.append('g')
        .attr({
            'id': 'ft-image-buffer',
            'transform': 'translate(' + width / 2 + ',' + height / 2 + '),scale(1)'
        });

    let legend = svg.append('g')
        .attr({
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


    let rings = buffer.append('g')
        .attr({
            'id': 'ft-image-rings'
        });

    let links = buffer.append('g')
        .attr({
            'id': 'ft-image-links'
        });

    let nodes = buffer.append('g')
        .attr({
            'id': 'ft-image-nodes'
        });

    let charts = buffer.append('g')
        .attr({
            'id': 'ft-image-charts'
        });

    let labels = buffer.append('g')
        .attr({
            'id': 'ft-image-labels'
        });

    // let captions = buffer.append('g')
    //     .attr({
    //         'id': 'ft-image-captions'
    //     });

    let legendBackground = legend.append('rect')
        .attr({
            'width': 80,
            'height': 300,
            'x': - 80 - 10,
            'y': 10,
            'fill': '#fff',
            'stroke': '#777',
            'stroke-width': 0.5
        });

};


module.exports.updateLegend = (window, config) => {
    d3.select(window.document.body).select('#ft-image-legend')
        .attr({
            'visibility': config.user.legend.scale ? 'visible' : 'hidden'
        });

    let scale = parseFloat(
        d3.select(window.document.body).select('#ft-image-buffer')
            .attr('transform')
            .match(/\(.+?\)/g)[1]
            .slice(1, -1)
    );
    let data = d3.range(30, 0, -10);
    let circles = d3.select(window.document.body).select('#ft-image-legend').selectAll('circle')
        .data(data);
    let texts = d3.select(window.document.body).select('#ft-image-legend').selectAll('text')
        .data(data);


    let circle = circles.enter().append('circle')
        .attr({
            'cx': - 10 - 80 / 2,
            'cy': (d, i) => {
                return i * 100 + 60;
            },
            'r': (d) => {
                return d;
            },
            'fill': '#ddd'
        });


    let textEnter = texts.enter().append('text')
        .attr({
            'x': - 10 - 80 / 2,
            'y': (d, i) => {
                return (i * 100 + 60) + d + 20;
            },
            'font-size': 12,
            'font-family': 'sans-serif',
            'font-weight': 'bold',
            'text-anchor': 'middle',
            'fill': '#777'
        })
        .text((d) => {
            return (d / scale).toFixed(1);
        });


    let textUpdate = texts
        .text((d) => {
            return (d / scale).toFixed(1);
        });
};


module.exports.updateRings = (window, config, root) => {
    let diameter = config.user.attribute.diameter;

    let tree = getTreeLayout(diameter);
    let nodes = tree.nodes(root);
    let max = d3.max(_.pluck(nodes, 'depth'));
    let ring = d3.select(window.document.body).select('#ft-image-rings').selectAll('circle')
        .data(d3.range(1, max, 2));

    let ringEnter = ring.enter().append('circle')
        .attr({
            'fill': 'none',
            'r': (d) => { return (diameter / 2 - 120) / max * (d + 0.5); },
            'stroke': '#f8f8f8',
            // 'stroke-width': 0
            'stroke-width': (diameter / 2 - 120) / max // 0
        });

    let ringUpdate = ring.transition().duration(1000)
        .attr({
            'r': (d) => { return (diameter / 2 - 120) / max * (d + 0.5); },
            'stroke-width': (diameter / 2 - 120) / max
        });

    let ringExit = ring.exit().transition().duration(1000)
        .attr({
            'stroke-width': 0
        })
        .remove();
};


module.exports.updateLinks = (window, config, root, source) => {
    let diameter = config.user.attribute.diameter;

    let tree = getTreeLayout(diameter);
    let nodes = tree.nodes(root);
    let links = tree.links(nodes);
    let diagonal = d3.svg.diagonal.radial()
        .projection((d) => { return [d.y, d.x / 180 * Math.PI]; });
    let straight = (d) => {
        let x = (d) => { return d.y * Math.cos((d.x - 90) / 180 * Math.PI); };
        let y = (d) => { return d.y * Math.sin((d.x - 90) / 180 * Math.PI); };
        return 'M' + x(d.source) + ',' + y(d.source) + 'L' + x(d.target) + ',' + y(d.target);
    };
    let link = d3.select(window.document.body).select('#ft-image-links').selectAll('path')
        .data(links, (d) => { return d.target.id; });


    let linkEnter = link.enter().append('path')
        .attr({
            'fill': 'none',
            'stroke': '#999',
            'stroke-width': 0.3,
            'stroke-dasharray': (d) => {
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
            'd': (d) => {
                if (d.source.depth === 0) {
                    return straight(d);
                } else {
                    return diagonal(d);
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


    let linkUpdate = link.transition().duration(1000)
        .attr({
            'd': (d) => {
                if (d.source.depth === 0) {
                    return straight(d);
                } else {
                    return diagonal(d);
                }
            }
        });


    let linkExit = link.exit().transition().duration(1000)
        .attr({
            'd': (d) => {
                let o = { 'x': source.x, 'y': source.y };
                if (d.source.depth === 0) {
                    return straight({ 'source': o, 'target': o });
                } else {
                    return diagonal({ 'source': o, 'target': o });
                }
            }
        })
        .remove();
};


module.exports.updateNodes = (window, config, root, source) => {
    let diameter = config.user.attribute.diameter;

    let tree = getTreeLayout(diameter);
    let nodes = tree.nodes(root);
    let node = d3.select(window.document.body).select('#ft-image-nodes').selectAll('circle')
        .data(nodes, (d) => { return d.id; });


    let nodeEnter = node.enter().append('circle')
        .attr({
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
            'data-original-title': (d) => {
                return d.name + ': ' + d.label;
            },
            'fill': (d) => {
                return d._children ? '#ddd' : '#fff';
            },
            'transform': (d) => {
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


    let nodeUpdate = node.transition().duration(1000)
        .attr({
            'fill': (d) => {
                return d._children ? '#ddd' : '#fff';
            },
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            }
        });


    let nodeExit = node.exit().transition().duration(1000)
        .attr({
            'r': 0,
            'transform': (d) => {
                return 'rotate(' + (source.x - 90) + '),translate(' + source.y + ')';
            }
        })
        .remove();


    // $('[data-toggle="tooltip"]').tooltip({
    //     container: 'body',
    //     placement: 'top'
    // });
};


module.exports.updateCharts = (window, config, root, source) => {
    let diameter = config.user.attribute.diameter;

    let tree = getTreeLayout(diameter);
    var nodes = tree.nodes(root);
    var all = nodes;
    var chart = d3.select(window.document.body).select('#ft-image-charts').selectAll('g')
        .data(nodes, (d) => { return d.id; });

    // depthの中で最大の合計値を返す
    var getMax = _.memoize((depth) => {
        var max = _.chain(all)
            // .filter((i) => {
            //     return i.depth === depth;
            // })
            .pluck('value')
            .max()
            .value();
        return max;
    });

    var getMaxForValues = _.memoize((depth) => {
        var max = _.chain(all)
            // .filter((i) => {
            //     return i.depth === depth;
            // })
            .pluck('values')
            .map((i) => {
                return d3.sum(i);
            })
            .max()
            .value();
        return max;
    });


    var chartEnter = chart.enter().append('g')
        .attr({
            // 'transform': (d) => {
            //     return 'rotate(' + (source.x0 - 90) + '),translate(' + source.y0 + ')';
            // }
            'transform': (d) => {
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

    
    var chartUpdate = chart.transition().duration(1000)
        .attr({
            'transform': (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            }
        });


    var chartExit = chart.exit().transition().duration(1000)
        .attr({
            'transform': (d) => {
                return 'rotate(' + (source.x - 90) + '),translate(' + source.y + ')';
            }
        })
        .remove();


    var circle = chart.selectAll('circle')
        .data((d) => {
            return [d];
        });


    var circleEnter = circle.enter().append('circle')
        .attr({
            // 'r': function(d) {
            //     return 0;
            // },
            'r': (d) => {
                var max = getMax(d.depth);
                return config.user.normalization.circle ? d.value / max * 30 : d.value;
            },
            'fill': (d) => {
                return d.color;
            },
            'opacity': 0.8,
            'data-toggle': 'tooltip',
            'data-original-title': (d) => {
                return d.name + ': ' + d.value;
            }
        })
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


    var circleUpdate = circle.transition().duration(1000)
        .attr({
            'r': (d) => {
                var max = getMax(d.depth);
                return config.user.normalization.circle ? d.value / max * 30 : d.value;
            },
            'fill': (d) => {
                return d.color;
            },
            // 20160203: valueは可変なのでupdateにも記述が必要
            'data-toggle': 'tooltip',
            'data-original-title': (d) => {
                return d.name + ': ' + d.value;
            }
        });


    var circleExit = circle.exit().transition().duration(1000)
        .attr({
            'r': 0
        })
        .remove();


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

    _.each(nodes, function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // $('[data-toggle="tooltip"]').tooltip({
    //     container: 'body',
    //     placement: 'top'
    // });
}
