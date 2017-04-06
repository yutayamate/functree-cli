'use strict'

import d3 from 'd3';

export default class {
    constructor(root, config) {
        this.config = config;
        this.root = root;
        this.root.x0 = 0;
        this.root.y0 = 0;
        this.nodes = this.getNodes();
    }

    // Return list of all nodes (assigning tree depth)
    getNodes(d=this.root, nodes=[], depth=0) {
        d.depth = depth;
        nodes.push(d);
        for (const i of (d.children || d._children || [])) {
            this.getNodes(i, nodes, depth + 1);
        };
        return nodes;
    }

    // Zero-initialize nodes
    init() {
        for (const i of this.nodes) {
            i.value = 0;
            i.values = [];
            if (i.depth === this.config.displayNodesLowerThan - 1) {
                i._children = i.children;
                i.children = null;
            }
        }
        return this;
    }

    // Assign input data to nodes
    assign(data) {
        for (const i of this.nodes) {
            if (!(i.depth < this.config.mapObjectsHigherThan || i.label.match(/^Undefined/))) {
                Object.assign(i, data[i.name]);
            }
        }
        return this;
    }

    // Create visualization
    visualize(document) {
        const tree = d3.layout.tree()
            .size([360, this.config.diameter / 2 - 120]);
        const nodes = tree.nodes(this.root);
        const links = tree.links(nodes);
        const maxDepth = d3.max(
            nodes.map((x) => {
                return x.depth;
            })
        );
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

        this._createSVG(
            document
        );
        this._updateRings(
            document,
            maxDepth
        );
        this._updateLinks(
            document,
            links
        );
        this._updateNodes(
            document,
            nodes
        );
        if (this.config.displayBars) {
            this._updateCharts(
                document,
                nodes,
                maxDepth,
                maxSumOfValues,
                maxMaxOfValues
            );
        }
        if (this.config.displayCircles) {
            this._updateRounds(
                document,
                nodes,
                maxDepth,
                maxValue
            );
        }
        if (this.config.displayLabels) {
            this._updateLabels(
                document,
                nodes,
                maxValue,
                maxSumOfValues
            );
        }
        if (this.config.displayLegends && this.config.displayBars) {
            this._updateLegends(
                document
            );
        }
    }

    _createSVG(document) {
        const svg = d3.select(document.body)
            .select('#' + this.config.viewerElementId)
            .append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('version', '1.1')
            .attr('width', this.config.width)
            .attr('height', this.config.height);
        const buffer = svg.append('g')
            .attr('id', 'buffer')
            .attr('transform', 'translate(' + this.config.width / 2 + ',' + this.config.height / 2 + '),scale(1)');
        const legend = svg.append('g')
            .attr('id', 'legend');

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

    _updateRings(document, maxDepth) {
        const ring = d3.select(document.body)
            .select('#rings')
            .selectAll('circle')
            .data(d3.range(1, maxDepth, 2));
        const enter = ring
            .enter()
            .append('circle')
            .attr('fill', 'none')
            .attr('r', (d) => {
                return (this.config.diameter / 2 - 120) / maxDepth * (d + 0.5) || 0;
            })
            .attr('stroke', '#f8f8f8')
            .attr('stroke-width', (this.config.diameter / 2 - 120) / maxDepth || 0);
    }

    _updateLinks(document, links) {
        const diagonal = d3.svg.diagonal.radial()
            .projection((d) => {
                return [d.y, d.x / 180 * Math.PI];
            });
        const straight = (d) => {
            const x = (d) => {
                return d.y * Math.cos((d.x - 90) / 180 * Math.PI);
            };
            const y = (d) => {
                return d.y * Math.sin((d.x - 90) / 180 * Math.PI);
            };
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

    _updateCharts(document, nodes, maxDepth, maxSumOfValues, maxMaxOfValues) {
        const config = this.config;
        let color = null;
        switch (this.config.mappingStyle) {
            case 'stacked':
            case 'stacked-100':
                color = d3.scale.category20();
                break;
            case 'heatmap':
                const scheme = this.config.colorSchemeLinear
                    .map((x) => {
                        return d3.rgb(x);
                    });
                color = (value, depth) => {
                    const binWidth = (maxMaxOfValues[depth] - 0) / (scheme.length - 1);
                    const domain = [];
                    for (let i = 0; i < scheme.length; i++) {
                        domain.push(binWidth * i);
                    }
                    return d3.scale.linear()
                        .domain(domain)
                        .range(scheme)(value);
                };
        }
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
                const height = (config.diameter / 2 - 120) / maxDepth * 0.80;
                const subSum = d3.sum(p.values.slice(0, i));
                switch (config.mappingStyle) {
                    case 'stacked':
                        if (config.normalizeBarHight) {
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
                const height = (config.diameter / 2 - 120) / maxDepth * 0.80;
                switch (config.mappingStyle) {
                    case 'stacked':
                        if (config.normalizeBarHight) {
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
                switch (config.mappingStyle) {
                    case 'stacked':
                    case 'stacked-100':
                        return color(i);
                    case 'heatmap':
                        return color(d, p.depth);
                }
            })
            .attr('data-toggle', 'tooltip')
            .attr('data-original-title', function(d, i) {
                const p = this.parentNode.__data__;
                return p.name + '; ' + p.label;
            });
    }

    _updateRounds(document, nodes, maxDepth, maxValue) {
        const color = (n) => {
            const scheme = this.config.colorSchemeCategorical;
            const rgb = scheme[n % scheme.length];
            return d3.rgb(rgb);
        };
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
                const r = (this.config.diameter / 2 - 120) / maxDepth * 0.25;
                if (this.config.normalizeCircleRadius) {
                    return d.value / maxValue[d.depth] * r || 0.0;
                } else {
                    return d.value;
                }
            })
            .attr('fill', (d) => {
                return this.config.displayBars ? '#fff' : color(d.depth);
            })
            .attr('stroke', () => {
                return this.config.displayBars ? '#333' : '#fff';
            })
            .attr('stroke-width', (d) => {
                return 1;
            })
            .attr('opacity', 0.75)
            .attr('data-toggle', 'tooltip')
            .attr('data-original-title', (d) => {
                return d.name + '; ' + d.label;
            })
            .attr('transform', (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            });
    }

    _updateLabels(document, nodes, maxValue, maxSumOfValues) {
        const data = nodes
            .filter((d) => {
                const isValidNodeName = !d.label.match(/^Undefined/);
                const isValidRange = (() => {
                    const scoresInLayer = nodes
                        .filter((x) => {
                            return d.depth === x.depth;
                        })
                        .map((x) => {
                            return this.config.displayCircles ?
                                x.value :
                                d3.sum(x.values);
                        })
                        .sort((x, y) => {
                            return y - x;
                        });
                    const score = this.config.displayCircles ?
                        d.value :
                        d3.sum(d.values);
                    const rank = scoresInLayer.indexOf(score);
                    const threshold = this.config.displayLabelsThresholds[d.depth] || 0;
                    return rank < Math.floor(scoresInLayer.length * threshold);
                })();
                return isValidNodeName && isValidRange;
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
            .attr('y', (d) => {
                const max = this.config.displayCircles ?
                    maxValue[d.depth] :
                    maxSumOfValues[d.depth];
                const score = this.config.displayCircles ?
                    d.value :
                    d3.sum(d.values);
                const size = 5 + score / max * 10;
                return -size / 2;
            })
            .attr('font-family', 'Helvetica')
            .attr('font-size', (d) => {
                const max = this.config.displayCircles ?
                    maxValue[d.depth] :
                    maxSumOfValues[d.depth];
                const score = this.config.displayCircles ?
                    d.value :
                    d3.sum(d.values);
                const size = 5 + score / max * 10;
                return size;
            })
            .attr('text-anchor', 'middle')
            .attr('fill', '#555')
            .attr('transform', (d) => {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + '),rotate(' + (90 - d.x) + ')';
            })
            .text((d) => {
                const label = eval('d.' + this.config.labelDataKey);
                const labelSubStr = label
                    .replace(/ \[.*\]/, '')
                    .split(', ')[0];
                return labelSubStr;
        });
    }

    _updateLegends(document) {
        switch (this.config.mappingStyle) {
            case 'stacked':
            case 'stacked-100':
                const color = d3.scale.category20();
                const legend = d3.select(document.body)
                    .select('#legend')
                    .selectAll('text')
                    .data(this.root.keys);
                const enter = legend
                    .enter()
                    .append('text')
                    .attr('font-family', 'Helvetica')
                    .attr('font-size', 14)
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', '#555')
                    .attr('x', 20)
                    .attr('y', (d, i) => {
                        return 30 + i * 20;
                    })
                    .html((d, i) => {
                        return '<tspan fill="' + color(i) + '">■</tspan> ' + d;
                    });
                break;
            case 'heatmap':
                // in progress..
                break;
        }
    }
};
