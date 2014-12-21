var React = require('react/addons');
var Tile = require('./Tile.jsx');
require('react-mixin-manager')(React);
require('react-events')(React);

var MARGIN = 8;
var ROW_INNER_HEIGHT = 220;
var COL_INNER_WIDTH = 220;
var ROW_OUTER_HEIGHT = 220 + MARGIN;
var COL_OUTER_WIDTH = 220 + MARGIN;

var TileGrid = React.createClass({
    mixins: ['events'],

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
            animatingTileComputedTransforms: {}
        };
    },

    render: function render() {
        var totalWidth = this.state.cols * COL_OUTER_WIDTH;

        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <div
                    ref="inner"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        opacity: this.state.mounted ? '1.0': '0.0',
                        transitionProperty: 'opacity',
                        transitionDuration: '0.2s',
                        transform: 'scale(' + this.state.scale + ')',
                        marginLeft: -totalWidth / 2 + 'px',
                        minHeight: ROW_OUTER_HEIGHT * this.state.rows + 'px',
                        marginTop: (-ROW_OUTER_HEIGHT * this.state.rows) / 2 + 'px',
                        width: totalWidth + 'px'
                    }}
                >
                    {this.props.tileData.map(function renderTile(t, i) {
                        return (
                            <Tile
                                key={i}
                                ref={'tile-' + i}
                                backgroundColor={t.backgroundColor}
                                title={t.title}
                                url={t.url}
                                shouldAnimate={i === this.state.animatingTileIndex}
                                animationTransforms={this.state.animatingTileComputedTransforms}
                                onClick={this.fillScreen.bind(this, i)}
                            />
                        );
                    }.bind(this))}
                </div>
            </div>
        );
    },

    componentDidMount: function componentDidMount() {
        this.setState({
            mounted: true
        });

        this.layout();
    },

    layout: function layout() {
        if (this.isMounted()) {
            var node = this.getDOMNode();
            var maxHeight = node.offsetHeight - MARGIN;
            var maxWidth = node.offsetWidth - MARGIN;
            var rows = Math.max(Math.ceil(Math.sqrt(this.props.tileData.length * maxHeight / maxWidth)), 1);
            var cols = Math.ceil(this.props.tileData.length / rows);

            if ((rows - 1) * cols >= this.props.tileData.length && this.props.tileData.length < rows * cols) {
                rows--;
            }

            var unscaledWidth = cols * COL_OUTER_WIDTH;
            var scale = maxWidth / (unscaledWidth + 20);

            if (ROW_OUTER_HEIGHT * rows * scale > maxHeight) {
                scale = maxHeight / (ROW_OUTER_HEIGHT * rows);
            }

            this.setState({
                scale: scale,
                rows: rows,
                cols: cols
            });
        }
    },

    fillScreen: function fillScreen(index) {
        if (this.isMounted()) {
            var node = this.getDOMNode();
            var tileComponent = this.refs['tile-' + index];
            if (tileComponent) {
                var tileNode = tileComponent.getDOMNode();
                var maxWidth = node.offsetWidth;
                var maxHeight = node.offsetHeight;
                var tileData = this.props.tileData;

                var scaleX = maxWidth / this.state.scale / COL_INNER_WIDTH;
                var scaleY = maxHeight / this.state.scale / ROW_INNER_HEIGHT;
                var sitesMidX = this.state.cols * COL_OUTER_WIDTH / 2;
                var sitesMidY = this.state.rows * ROW_OUTER_HEIGHT / 2;
                var centerX = tileNode.offsetLeft + COL_INNER_WIDTH / 2;
                var centerY = tileNode.offsetTop + ROW_INNER_HEIGHT / 2;
                var translateX = sitesMidX - centerX;
                var translateY = sitesMidY - centerY;

                this.setState({
                    animatingTileIndex: index,
                    animatingTileComputedTransforms: {
                        translateX: translateX,
                        translateY: translateY,
                        scaleX: scaleX,
                        scaleY: scaleY
                    }
                });
            }
        }
    }
});

module.exports = TileGrid;
