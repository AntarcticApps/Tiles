var React = require('react/addons');
var Tile = require('./Tile.jsx');
var { DragDropMixin } = require('react-dnd');
require('react-mixin-manager')(React);
require('react-events')(React);

var MARGIN = 8;
var ROW_INNER_HEIGHT = 220;
var COL_INNER_WIDTH = 220;
var ROW_OUTER_HEIGHT = 220 + MARGIN;
var COL_OUTER_WIDTH = 220 + MARGIN;

var TileGrid = React.createClass({
    mixins: ['events', DragDropMixin],

    events: {
        'window:resize': 'layout'
    },

    propTypes: {
        tileData: React.PropTypes.array
    },

    getDefaultProps: function getDefaultProps() {
        return {
            tileData: []
        };
    },

    getInitialState: function getInitialState() {
        return {
            mounted: false,
            animatingTileIndex: -1,
            animatingTileComputedTransforms: {},
            transforms: {}
        };
    },

    configureDragDrop(registerType) {
        registerType('tile', {
            dropTarget: {
                over(item, e) {
                    var left = Math.round((e.pageX - item.startPageX));
                    var top = Math.round((e.pageY - item.startPageY));

                    if (this.props.snapToGrid) {
                        left = Math.round(left / 32) * 32;
                        top = Math.round(top / 32) * 32;
                    }

                    this.moveTile(item.identifier, left, top);
                },

                acceptDrop(item) {
                    this.dropTile(item.identifier);
                }
            }
        });
    },

    moveTile: function moveTile(id, left, top) {
        var transforms = {};
        transforms[id] = {
            x: left,
            y: top
        };
        this.setState({
            transforms: transforms
        });
    },

    dropTile: function dropTile(id) {
        this.setState({
            transforms: {}
        });
    },

    render: function render() {
        return (
            <div
                {...this.dropTargetFor('tile')}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <div
                    ref="inner"
                    style={{
                        opacity: this.state.mounted ? '1.0': '0.0',
                        transitionProperty: 'opacity',
                        transitionDuration: '0.2s',
                        width: this.getContainerWidth(),
                        height: this.getContainerHeight(),
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {this.renderTiles()}
                </div>
            </div>
        );
    },

    renderTiles: function renderTiles() {
        if (this.state.mounted) {
            var colWidth = this.getTileLength();
            var rowHeight = colWidth;
            var tileWidth = colWidth - MARGIN;
            var tileHeight = rowHeight - MARGIN;

            return this.props.tileData.map(function renderTile(t, i) {
                var tileRow = Math.floor(i / this.state.cols);
                var tileCol = i % this.state.cols;
                var tileX = tileCol * colWidth + MARGIN;
                var tileY = tileRow * rowHeight + MARGIN;

                return (
                    <Tile
                        key={i}
                        identifier={i}
                        backgroundColor={t.backgroundColor}
                        title={t.title}
                        url={t.url}
                        width={tileWidth}
                        height={tileHeight}
                        x={tileX}
                        y={tileY}
                        animationCenterX={this.getContainerWidth() / 2}
                        animationCenterY={this.getContainerHeight() / 2}
                        animationWidth={this.state.outerWidth}
                        animationHeight={this.state.outerHeight}
                        translateX={this.state.transforms[i] ? this.state.transforms[i].x : 0}
                        translateY={this.state.transforms[i] ? this.state.transforms[i].y : 0}
                        dragging={this.state.transforms[i]}
                    />
                );
            }.bind(this));
        }
    },

    getContainerWidth: function getContainerWidth() {
        return this.getTileLength() * this.state.cols + MARGIN;
    },

    getContainerHeight: function getContainerHeight() {
        return this.getTileLength() * this.state.rows + MARGIN;
    },

    getTileLength: function getTileLength() {
        var colWidth = ((this.state.outerWidth - MARGIN) / this.state.cols);
        var rowHeight = ((this.state.outerHeight - MARGIN) / this.state.rows);
        return Math.min(colWidth, rowHeight);
    },

    componentDidMount: function componentDidMount() {
        this.layout();
    },

    layout: function layout() {
        var node = this.getDOMNode();
        var offsetHeight = node.offsetHeight;
        var offsetWidth = node.offsetWidth;
        var rows = Math.max(Math.ceil(Math.sqrt(this.props.tileData.length * offsetHeight / offsetWidth)), 1);
        var cols = Math.ceil(this.props.tileData.length / rows);

        if ((rows - 1) * cols >= this.props.tileData.length && this.props.tileData.length < rows * cols) {
            rows--;
        }

        this.setState({
            mounted: true,
            rows: rows,
            cols: cols,
            outerHeight: offsetHeight,
            outerWidth: offsetWidth
        });
    }
});

module.exports = TileGrid;
