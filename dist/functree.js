'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(root, config) {
        _classCallCheck(this, _class);

        root.x0 = 0;
        root.y0 = 0;
        this.root = root;
        this.config = config;
        this.nodes = this._getNodes();
    }

    // Return list of all nodes


    _createClass(_class, [{
        key: '_getNodes',
        value: function _getNodes() {
            var d = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.root;
            var nodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            nodes.push(d);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (d.children || d._children || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var i = _step.value;

                    this._getNodes(i, nodes);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            ;
            return nodes;
        }

        // Zero-initialize value(s), keyname and color

    }, {
        key: 'init',
        value: function init() {
            var _this = this;

            var nodes = this.nodes;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var i = _step2.value;

                    i.value = 0;
                    i.values = [];
                    i.keys = [];
                    i.color = function (n) {
                        var scheme = _this.config.color_scheme.category;
                        var rgbCode = scheme[n % scheme.length];
                        return _d2.default.rgb(rgbCode);
                    }(i.depth);
                    if (i.name.match(/md:M\d{5}|md:EPM\d{4}|Undefined MODULE/)) {
                        if (this.config.functree.show_all_nodes) {
                            continue;
                        }
                        i._children = i.children;
                        i.children = null;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return this;
        }

        // Assign input data to all nodes

    }, {
        key: 'mapping',
        value: function mapping(data) {
            var nodes = this.nodes;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var i = _step3.value;

                    if (i.depth < this.config.functree.disable_display_lower_than || i.label.match('Undefined')) {
                        continue;
                    }
                    Object.assign(i, data[i.name]);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return this;
        }

        // Draw SVG on document.body

    }, {
        key: 'visualize',
        value: function visualize(document) {
            var diameter = this.config.functree.attribute.diameter;
            var tree = _d2.default.layout.tree().size([360, diameter / 2 - 120]);
            var nodes = tree.nodes(this.root);
            var links = tree.links(nodes);
            var maxDepth = _d2.default.max(nodes.map(function (x) {
                return x.depth;
            }));
            var maxValue = Array.from(new Array(maxDepth + 1)).map(function (v, i) {
                var layerValue = nodes.filter(function (x) {
                    return x.depth === i;
                }).map(function (x) {
                    return x.value;
                });
                return _d2.default.max(layerValue);
            });
            var maxSumOfValues = Array.from(new Array(maxDepth + 1)).map(function (v, i) {
                var layerSumOfValues = nodes.filter(function (x) {
                    return x.depth === i;
                }).map(function (x) {
                    return _d2.default.sum(x.values);
                });
                return _d2.default.max(layerSumOfValues);
            });
            var maxMaxOfValues = Array.from(new Array(maxDepth + 1)).map(function (v, i) {
                var layerMumOfValues = nodes.filter(function (x) {
                    return x.depth === i;
                }).map(function (x) {
                    return _d2.default.max(x.values);
                });
                return _d2.default.max(layerMumOfValues);
            });

            this._initSVG(document, this.config.functree.attribute.width, this.config.functree.attribute.height, this.config.target_id);
            this._updateRings(document, diameter, maxDepth);
            this._updateLinks(document, links, this.root);
            this._updateNodes(document, nodes);
            if (!this.config.functree.disable_display_charts) {
                this._updateCharts(document, nodes, diameter, maxDepth, maxSumOfValues, maxMaxOfValues, this.config.functree.style, this.config.color_scheme.linear, this.config.functree.enable_normalize_charts);
            }
            if (!this.config.functree.disable_display_rounds) {
                this._updateRounds(document, nodes, maxValue, this.config.functree.enable_normalize_rounds);
            }
            if (!this.config.functree.disable_display_labels) {
                this._updateLabels(document, nodes, this.config.threshold, this.config.functree.label_data);
            }
        }
    }, {
        key: '_initSVG',
        value: function _initSVG(document, height, width, targetID) {
            var buffer = _d2.default.select(document.body).select('#' + targetID).append('svg').attr('xmlns', 'http://www.w3.org/2000/svg').attr('version', '1.1').attr('width', width).attr('height', height).append('g').attr('id', 'buffer').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + '),scale(1)');

            var groupIDs = ['rings', 'links', 'nodes', 'charts', 'rounds', 'labels'];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = groupIDs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var i = _step4.value;

                    buffer.append('g').attr('id', i);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: '_updateRings',
        value: function _updateRings(document, diameter, maxDepth) {
            var ring = _d2.default.select(document.body).select('#rings').selectAll('circle').data(_d2.default.range(1, maxDepth, 2));
            var enter = ring.enter().append('circle').attr('fill', 'none').attr('r', function (d) {
                return (diameter / 2 - 120) / maxDepth * (d + 0.5) || 0;
            }).attr('stroke', '#f8f8f8').attr('stroke-width', (diameter / 2 - 120) / maxDepth || 0);
        }
    }, {
        key: '_updateLinks',
        value: function _updateLinks(document, links, source) {
            var diagonal = _d2.default.svg.diagonal.radial().projection(function (d) {
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
            var link = _d2.default.select(document.body).select('#links').selectAll('path').data(links, function (d) {
                return d.target.id;
            });
            var enter = link.enter().append('path').attr('fill', 'none').attr('stroke', '#999').attr('stroke-width', 0.3).attr('stroke-dasharray', function (d) {
                if (d.source.depth === 0) {
                    return '3,3';
                }
            }).attr('d', function (d) {
                if (d.source.depth === 0) {
                    return straight(d);
                } else {
                    return diagonal(d);
                }
            });
        }
    }, {
        key: '_updateNodes',
        value: function _updateNodes(document, nodes) {
            var node = _d2.default.select(document.body).select('#nodes').selectAll('circle').data(nodes, function (d) {
                return d.id;
            });
            var enter = node.enter().append('circle').attr('transform', function (d) {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            }).attr('r', 0.5).attr('fill', function (d) {
                return d._children ? '#ddd' : '#fff';
            }).attr('stroke', '#999').attr('stroke-width', 0.3).attr('cursor', 'pointer').attr('data-toggle', 'tooltip').attr('data-original-title', function (d) {
                return d.name + '; ' + d.label;
            });
        }
    }, {
        key: '_updateCharts',
        value: function _updateCharts(document, nodes, diameter, maxDepth, maxSumOfValues, maxMaxOfValues, style, scheme, enableNormalization) {
            var chartColor = {
                'category': _d2.default.scale.category20(),
                'linear': function linear(value, depth) {
                    return _d2.default.scale.linear().domain([0, maxMaxOfValues[depth]]).range(scheme.map(function (x) {
                        return _d2.default.rgb(x);
                    }))(value);
                }
            };

            var chart = _d2.default.select(document.body).select('#charts').selectAll('g').data(nodes, function (d) {
                return d.id;
            });
            var chartEnter = chart.enter().append('g').attr('transform', function (d) {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            });
            var rect = chart.selectAll('rect').data(function (d) {
                return d.values;
            });
            var rectEnter = rect.enter().append('rect')
            // Specify vertical postion
            .attr('x', function (d, i) {
                var p = this.parentNode.__data__;
                var height = (diameter / 2 - 120) / maxDepth * 0.80;
                var subSum = _d2.default.sum(p.values.slice(0, i));
                switch (style) {
                    case 'stacked':
                        if (enableNormalization) {
                            var max = maxSumOfValues[p.depth];
                            return subSum / max * height || 0;
                        } else {
                            return subSum;
                        }
                    case 'stacked-100':
                        var sum = _d2.default.sum(p.values);
                        return height / sum * subSum;
                    case 'heatmap':
                        return height / p.values.length * i;
                }
            })
            // Specify horizontal postion
            .attr('y', function () {
                var p = this.parentNode.__data__;
                return -(2 + (maxDepth - p.depth) / maxDepth * 3) / 2;
            }).attr('width', function (d) {
                var p = this.parentNode.__data__;
                var height = (diameter / 2 - 120) / maxDepth * 0.80;
                switch (style) {
                    case 'stacked':
                        if (enableNormalization) {
                            var max = maxSumOfValues[p.depth];
                            return d / max * height || 0;
                        } else {
                            return d;
                        }
                    case 'stacked-100':
                        var sum = _d2.default.sum(p.values);
                        return height / sum * d;
                    case 'heatmap':
                        return height / p.values.length;
                }
            }).attr('height', function () {
                var p = this.parentNode.__data__;
                return 2 + (maxDepth - p.depth) / maxDepth * 3;
            }).attr('fill', function (d, i) {
                var p = this.parentNode.__data__;
                switch (style) {
                    case 'stacked':
                    case 'stacked-100':
                        return chartColor.category(i);
                    case 'heatmap':
                        return chartColor.linear(d, p.depth);
                }
            }).attr('data-toggle', 'tooltip').attr('data-original-title', function (d, i) {
                var p = this.parentNode.__data__;
                return p.name + '; ' + p.label;
            });
        }
    }, {
        key: '_updateRounds',
        value: function _updateRounds(document, nodes, maxValue, enableNormalization) {
            var circle = _d2.default.select(document.body).select('#rounds').selectAll('circle').data(nodes, function (d) {
                return d.id;
            });
            var enter = circle.enter().append('circle').attr('r', function (d) {
                if (enableNormalization) {
                    return d.value / maxValue[d.depth] * 20 || 0.0;
                } else {
                    return d.value;
                }
            }).attr('fill', function (d) {
                return d.color;
            }).attr('stroke', '#fff').attr('stroke-width', function (d) {
                return 0.5;
            }).attr('opacity', 0.4).attr('data-toggle', 'tooltip').attr('data-original-title', function (d) {
                return d.name + '; ' + d.label;
            }).attr('transform', function (d) {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + ')';
            });
        }
    }, {
        key: '_updateLabels',
        value: function _updateLabels(document, nodes, threshold, labelKey) {
            var data = nodes.filter(function (d) {
                var isValidNodeName = !d.label.match('Undefined');
                var isValidLayer = 1 <= d.depth && d.depth <= 2;
                var isValidRange = function () {
                    var layerValueList = nodes.filter(function (x) {
                        return d.depth === x.depth && x.value > 0.0;
                    }).sort(function (x, y) {
                        return y.value - x.value;
                    }).map(function (x) {
                        return x.value;
                    });
                    var rank = layerValueList.indexOf(d.value);
                    return rank > Math.floor(layerValueList.length * (1 - threshold));
                }();
                return isValidNodeName && (isValidLayer || isValidRange);
            });

            var label = _d2.default.select(document.body).select('#labels').selectAll('text').data(data, function (d) {
                return d.id;
            });
            var enter = label.enter().append('text').attr('y', -10 / 2).attr('font-family', 'Helvetica').attr('font-size', 10).attr('text-anchor', 'middle').attr('fill', '#555').attr('transform', function (d) {
                return 'rotate(' + (d.x - 90) + '),translate(' + d.y + '),rotate(' + (90 - d.x) + ')';
            }).text(function (d) {
                var label = eval('d.' + labelKey);
                var labelSubStr = label.replace(/ \[.*\]/, '').split(', ')[0];
                return labelSubStr;
            });
        }
    }]);

    return _class;
}();

exports.default = _class;
;