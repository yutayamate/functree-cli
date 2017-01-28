'use strict'

import d3 from 'd3';

export default class {
    constructor(root, config) {
        root.x0 = 0;
        root.y0 = 0;
        this.root = root;
        this.config = config;
        this.nodes = this._getNodes();
    }

    // Return list of all nodes
    _getNodes(d=this.root, nodes=[]) {
        nodes.push(d);
        for (const i of (d.children || d._children || [])) {
            this._getNodes(i, nodes);
        };
        return nodes;
    }

    // Zero-initialize value(s), keyname and color
    init() {
        const nodes = this.nodes;
        for (const i of nodes) {
            i.value = 0;
            i.values = [];
            i.keys = [];
            i.color = ((n) => {
                const scheme = this.config.color_scheme.category;
                const rgbCode = scheme[n % scheme.length];
                return d3.rgb(rgbCode);
            })(i.depth);
            if (i.name.match(/md:M\d{5}|md:EPM\d{4}|Undefined MODULE/)) {
                if (this.config.functree.show_all_nodes) {
                    continue;
                }
                i._children = i.children;
                i.children = null;
            }
        }
        return this;
    }

    // Assign input data to all nodes
    mapping(data) {
        const nodes = this.nodes;
        for (const i of nodes) {
            if (i.depth < this.config.functree.disable_display_lower_than ||
                i.label.match('Undefined')) {
                continue;
            }
            Object.assign(i, data[i.name]);
        }
        return this;
    }

    // Draw SVG on document.body
    visualize(document) {
        const diameter = this.config.functree.attribute.diameter;
        const tree = d3.layout.tree()
            .size([360, diameter / 2 - 120]);
        const nodes = tree.nodes(this.root);
        const links = tree.links(nodes);
        const maxDepth = d3.max(nodes.map((x) => { return x.depth; }));
        const maxValue = Array.from(new Array(maxDepth + 1))
            .map((v, i) => {
                const layerValue = nodes
                    .filter((x) => {
                        return x.depth === i;
                    })
                    .map((x) => {
                        return x.value;
                    });
                return d3.max(layerValue);
            });
        const maxSumOfValues = Array.from(new Array(maxDepth + 1))
            .map((v, i) => {
                const layerSumOfValues = nodes
                    .filter((x) => {
                        return x.depth === i;
                    })
                    .map((x) => {
                        return d3.sum(x.values);
                    });
                return d3.max(layerSumOfValues);
            });
        const maxMaxOfValues = Array.from(new Array(maxDepth + 1))
            .map((v, i) => {
                const layerMumOfValues = nodes
                    .filter((x) => {
                        return x.depth === i;
                    })
                    .map((x) => {
                        return d3.max(x.values);
                    });
                return d3.max(layerMumOfValues);
            });

        this._initSVG(
            document,
            this.config.functree.attribute.width,
            this.config.functree.attribute.height,
            this.config.target_id
        );
        this._updateRings(
            document,
            diameter,
            maxDepth
        );
        this._updateLinks(
            document,
            links,
            this.root
        );
        this._updateNodes(
            document,
            nodes
        );
        if (!this.config.functree.disable_display_charts) {
            this._updateCharts(
                document,
                nodes,
                diameter,
                maxDepth,
                maxSumOfValues,
                maxMaxOfValues,
                this.config.functree.style,
                this.config.color_scheme.linear,
                this.config.functree.enable_normalize_charts
            );
        }
        if (!this.config.functree.disable_display_rounds) {
            this._updateRounds(
                document,
                nodes,
                maxValue,
                this.config.functree.enable_normalize_rounds
            );
        }
        if (!this.config.functree.disable_display_labels) {
            this._updateLabels(
                document,
                nodes,
                this.config.threshold,
                this.config.functree.label_data
            );
        }
    }

    _initSVG(document, height, width, targetID) {
        const buffer = d3.select(document.body).select('#' + targetID)
            .append('svg')
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr('version', '1.1')
                .attr('width', width)
                .attr('height', height)
            .append('g')
                .attr('id', 'buffer')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + '),scale(1)');

        const groupIDs = [
            'rings',
            'links',
            'nodes',
            'charts',
            'rounds',
            'labels'
        ];
        for (const i of groupIDs) {
            buffer.append('g').attr('id', i);
        }
    }

    _updateRings(document, diameter, maxDepth) {
        const ring = d3.select(document.body)
            .select('#rings')
            .selectAll('circle')
            .data(d3.range(1, maxDepth, 2));
        const enter = ring
            .enter()
            .append('circle')
                .attr('fill', 'none')
                .attr('r', (d) => {
                    return (diameter / 2 - 120) / maxDepth * (d + 0.5) || 0;
                })
                .attr('stroke', '#f8f8f8')
                .attr('stroke-width', (diameter / 2 - 120) / maxDepth || 0);
    }

    _updateLinks(document, links, source) {
        const diagonal = d3.svg.diagonal.radial()
            .projection((d) => {
                return [d.y, d.x / 180 * Math.PI];
            });
        const straight = (d) => {
            const x = (d) => { return d.y * Math.cos((d.x - 90) / 180 * Math.PI); };
            const y = (d) => { return d.y * Math.sin((d.x - 90) / 180 * Math.PI); };
            return 'M' + x(d.source) + ',' + y(d.source) + 'L' + x(d.target) + ',' + y(d.target);
        };
        const link = d3.select(document.body)
            .select('#links')
            .selectAll('path')
            .data(links, (d) => {
                return d.target.id;
            });
        const enter = link
            .enter()
            .append('path')
                .attr('fill', 'none')
                .attr('stroke', '#999')
                .attr('stroke-width', 0.3)
                .attr('stroke-dasharray', (d) => {
                    if (d.source.depth === 0) {
                        return '3,3';
                    }
                })
                .attr('d', (d) => {
                    if (d.source.depth === 0) {
                        return straight(d);
                    } else {
                        return diagonal(d);
                    }
                });
    }

    _updateNodes(document, nodes) {
        const node = d3.select(document.body)
            .select('#nodes')
            .selectAll('circle')
            .data(nodes, (d) => {
                return d.id;
            });
        const enter = node
            .enter()
            .append('circle')
                .attr('transform', (d) => {
                    return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
                })
                .attr('r', 0.5)
                .attr('fill', (d) => {
                    return d._children ? '#ddd' : '#fff';
                })
                .attr('stroke', '#999')
                .attr('stroke-width', 0.3)
                .attr('cursor', 'pointer')
                .attr('data-toggle', 'tooltip')
                .attr('data-original-title', (d) => {
                    return d.name + '; ' + d.label;
                });
    }

    _updateCharts(document, nodes, diameter, maxDepth, maxSumOfValues, maxMaxOfValues, style, scheme, enableNormalization) {
        const chartColor = {
            'category': d3.scale.category20(),
            'linear': (value, depth) => {
                return d3.scale.linear()
                    .domain([0, maxMaxOfValues[depth]])
                    .range(scheme.map((x) => {
                        return d3.rgb(x);
                    }))(value);
            }
        };

        const chart = d3.select(document.body)
            .select('#charts')
            .selectAll('g')
            .data(nodes, (d) => {
                return d.id;
            });
        const chartEnter = chart
            .enter()
            .append('g')
                .attr('transform', (d) => {
                    return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
                });
        const rect = chart
            .selectAll('rect')
            .data((d) => {
                return d.values;
            });
        const rectEnter = rect
            .enter()
            .append('rect')
                // Specify vertical postion
                .attr('x', function(d, i) {
                    const p = this.parentNode.__data__;
                    const height = (diameter / 2 - 120) / maxDepth * 0.80;
                    const subSum = d3.sum(p.values.slice(0, i));
                    switch (style) {
                        case 'stacked':
                            if (enableNormalization) {
                                const max = maxSumOfValues[p.depth];
                                return subSum / max * height || 0;
                            } else {
                                return subSum;
                            }
                        case 'stacked-100':
                            const sum = d3.sum(p.values);
                            return height / sum * subSum;
                        case 'heatmap':
                            return height / p.values.length * i;
                    }
                })
                // Specify horizontal postion
                .attr('y', function() {
                    const p = this.parentNode.__data__;
                    return - (2 + (maxDepth - p.depth) / maxDepth * 3) / 2;
                })
                .attr('width', function(d) {
                    const p = this.parentNode.__data__;
                    const height = (diameter / 2 - 120) / maxDepth * 0.80;
                    switch (style) {
                        case 'stacked':
                            if (enableNormalization) {
                                const max = maxSumOfValues[p.depth];
                                return d / max * height || 0;
                            } else {
                                return d;
                            }
                        case 'stacked-100':
                            const sum = d3.sum(p.values);
                            return height / sum * d;
                        case 'heatmap':
                            return height / p.values.length;
                    }
                })
                .attr('height', function() {
                    const p = this.parentNode.__data__;
                    return 2 + (maxDepth - p.depth) / maxDepth * 3;
                })
                .attr('fill', function(d, i) {
                    const p = this.parentNode.__data__;
                    switch (style) {
                        case 'stacked':
                        case 'stacked-100':
                            return chartColor.category(i);
                        case 'heatmap':
                            return chartColor.linear(d, p.depth);
                    }
                })
                .attr('data-toggle', 'tooltip')
                .attr('data-original-title', function(d, i) {
                    const p = this.parentNode.__data__;
                    return p.name + '; ' + p.label;
                });
    }

    _updateRounds (document, nodes, maxValue, enableNormalization) {
        const circle = d3.select(document.body)
            .select('#rounds')
            .selectAll('circle')
            .data(nodes, (d) => {
                return d.id;
            });
        const enter = circle
            .enter()
            .append('circle')
                .attr('r', (d) => {
                    if (enableNormalization) {
                        return d.value / maxValue[d.depth] * 20 || 0.0;
                    } else {
                        return d.value;
                    }
                })
                .attr('fill', (d) => {
                    return d.color;
                })
                .attr('stroke', '#fff')
                .attr('stroke-width', (d) => {
                    return 0.5;
                })
                .attr('opacity', 0.4)
                .attr('data-toggle', 'tooltip')
                .attr('data-original-title', (d) => {
                    return d.name + '; ' + d.label;
                })
                .attr('transform', (d) => {
                    return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
                });
    }

    _updateLabels(document, nodes, threshold, labelKey) {
        const data = nodes
            .filter((d) => {
                const isValidNodeName = !d.label.match('Undefined');
                const isValidLayer = (1 <= d.depth && d.depth <= 2);
                const isValidRange = (() => {
                    const layerValueList = nodes
                        .filter((x) => {
                            return d.depth === x.depth && x.value > 0.0;
                        })
                        .sort((x, y) => {
                            return y.value - x.value;
                        })
                        .map((x) => {
                            return x.value;
                        });
                    const rank = layerValueList.indexOf(d.value);
                    return rank > Math.floor(layerValueList.length * (1 - threshold));
                })();
                return isValidNodeName && (isValidLayer || isValidRange)
            });

        const label = d3.select(document.body)
            .select('#labels')
            .selectAll('text')
            .data(data, (d) => {
                return d.id;
            });
        const enter = label
            .enter()
            .append('text')
            .attr('y', -10 / 2)
            .attr('font-family', 'Helvetica')
            .attr('font-size', 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#555')
            .attr('transform', (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + '),rotate(' + (90 - d.x) + ')';
            })
            .text((d) => {
                const label = eval('d.' + labelKey);
                const labelSubStr = label.replace(/ \[.*\]/, '').split(', ')[0];
                return labelSubStr;
            });
    }
};
