var React = require('react/addons');
var Tile = require('./Tile.jsx');
var { DragDropMixin } = require('react-dnd');
var _ = require('lodash');
var TileStore = require('../stores/TileStore');
var StoreMixin = require('fluxible-app').StoreMixin;
var changeTileIndexAction = require('../actions/changeTileIndex');
require('react-mixin-manager')(React);
require('react-events')(React);

var MARGIN_WINDOW_WIDTH_COEFFICIENT = 0.015;

var TileGrid = React.createClass({
    mixins: ['events', DragDropMixin, StoreMixin],

    statics: {
        storeListeners: [TileStore]
    },

    events: {
        'window:resize': 'layout'
    },

    getInitialState: function getInitialState() {
        return {
            mounted: false,
            transforms: {},
            tileData: this.getStore(TileStore).getTiles()
        };
    },

    configureDragDrop(registerType) {
        registerType('tile', {
            dropTarget: {
                over(item, e) {
                    var left = Math.round((e.pageX - item.startPageX + item.startX));
                    var top = Math.round((e.pageY - item.startPageY + item.startY));

                    this.moveTile(item.identifier, left, top);
                },

                acceptDrop(item) {
                    this.dropTile(item.identifier);
                }
            }
        });
    },

    onChange: function onChange() {
        this.setState({
            tileData: this.getStore(TileStore).getTiles()
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

        var index = this.getTileIndexForCoordinates({
            x: left,
            y: top
        });

        if (index !== undefined && index !== null) {
            this.props.context.executeAction(
                changeTileIndexAction,
                {
                    id: id,
                    newIndex: index
                }
            );
        }
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
                    boxSizing: 'border-box',
                    position: 'relative'
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
                        transform: 'translate(-50%, -50%)',
                        WebkitTransform: 'translate(-50%, -50%)'
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
            var tileWidth = colWidth - this.getMargin();
            var tileHeight = rowHeight - this.getMargin();

            var tileDataSortedByIdentifier = _.sortBy(
                this.state.tileData,
                function sortTileDataByIdentifier(t) {
                    return t.id;
                }
            );

            return tileDataSortedByIdentifier.map(function renderTile(t) {
                var i = t.sortIndex;
                var key = t.id;
                var { x, y } = this.getCoordinatesForTileIndex(i);

                return (
                    <Tile
                        key={key}
                        identifier={key}
                        backgroundColor={t.backgroundColor}
                        title={t.title}
                        url={t.url}
                        width={tileWidth}
                        height={tileHeight}
                        x={x}
                        y={y}
                        animationCenterX={this.getContainerWidth() / 2}
                        animationCenterY={this.getContainerHeight() / 2}
                        animationWidth={this.state.outerWidth}
                        animationHeight={this.state.outerHeight}
                        translateX={this.state.transforms[key] ? this.state.transforms[key].x : 0}
                        translateY={this.state.transforms[key] ? this.state.transforms[key].y : 0}
                        dragging={!!this.state.transforms[key]}
                    />
                );
            }.bind(this));
        }
    },

    getMargin: function getMargin() {
        return Math.round(window.innerWidth * MARGIN_WINDOW_WIDTH_COEFFICIENT);
    },

    getCoordinatesForTileIndex: function getCoordinatesForTileIndex(i) {
        var colWidth = this.getTileLength();
        var rowHeight = colWidth;
        var tileRow = Math.floor(i / this.state.cols);
        var tileCol = i % this.state.cols;
        var x = tileCol * colWidth + this.getMargin();
        var y = tileRow * rowHeight + this.getMargin();

        return {
            x: x,
            y: y
        };
    },

    getTileIndexForCoordinates: function getTileIndexForCoordinates(coordinates) {
        var { x, y } = coordinates;
        var colWidth = this.getTileLength();
        var rowHeight = colWidth;

        var col = Math.floor(x / this.getTileLength());
        var row = Math.floor(y / this.getTileLength());

        if (
            col >= 0 &&
            col < this.state.cols &&
            row >= 0 &&
            row < this.state.rows
        ) {
            return row * this.state.cols + col;
        }
    },

    getContainerWidth: function getContainerWidth() {
        return this.getTileLength() * this.state.cols + this.getMargin();
    },

    getContainerHeight: function getContainerHeight() {
        return this.getTileLength() * this.state.rows + this.getMargin();
    },

    getTileLength: function getTileLength() {
        var colWidth = ((this.state.outerWidth - this.getMargin()) / this.state.cols);
        var rowHeight = ((this.state.outerHeight - this.getMargin()) / this.state.rows);
        return Math.min(colWidth, rowHeight);
    },

    componentDidMount: function componentDidMount() {
        this.layout();
    },

    componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        if (Object.keys(this.state.tileData).length !== Object.keys(prevState.tileData).length) {
            this.layout();
        }
    },

    layout: function layout() {
        var node = this.getDOMNode();
        var offsetHeight = node.offsetHeight;
        var offsetWidth = node.offsetWidth;
        var tileCount = Object.keys(this.state.tileData).length;
        var rows = Math.max(Math.ceil(Math.sqrt(tileCount * offsetHeight / offsetWidth)), 1);
        var cols = Math.ceil(tileCount / rows);

        if ((rows - 1) * cols >= tileCount && tileCount < rows * cols) {
            rows--;
        }

        this.setState({
            mounted: true,
            rows: rows,
            cols: cols,
            outerHeight: offsetHeight,
            outerWidth: offsetWidth
        });
    },
});

module.exports = TileGrid;
