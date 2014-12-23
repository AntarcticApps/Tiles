var React = require('react/addons');
var ReactTransitionEvents = require('react/lib/ReactTransitionEvents');
var { DragDropMixin, DropEffects } = require('react-dnd');

var Tile = React.createClass({
    mixins: [DragDropMixin],

    propTypes: {
        backgroundColor: React.PropTypes.string,
        title: React.PropTypes.string,
        url: React.PropTypes.string,
        animationTransforms: React.PropTypes.object
    },

    configureDragDrop(registerType) {
        registerType('tile', {
            dragSource: {
                beginDrag(e) {
                    this.setState({
                        dragging: true
                    });

                    return {
                        effectAllowed: DropEffects.MOVE,
                        item: {
                            identifier: this.props.identifier,
                            startX: this.props.x,
                            startY: this.props.y,
                            startPageX: e.pageX,
                            startPageY: e.pageY
                        }
                    };
                },

                endDrag() {
                    this.setState({
                        dragging: false
                    });
                }
            }
        });
    },

    getDefaultProps: function getDefaultProps() {
        return {
            backgroundColor: 'white',
            title: null,
            url: null,
            animationTransforms: {}
        };
    },

    getInitialState: function getInitialState() {
        return {
            hover: false,
            animatingFillScreen: false,
            animatingDrop: false
        };
    },

    componentWillReceiveProps: function (nextProps) {
        if (this.props.dragging && !nextProps.dragging) {
            ReactTransitionEvents.addEndEventListener(this.getDOMNode(), this.onDropTransitionEnd);
            this.setState({
                animatingDrop: true
            });
        }
    },

    render: function render() {
        return (
            <a
                href={this.props.url}
                style={{
                    display: 'block',
                    position: 'absolute',
                    width: this.props.width + 'px',
                    height: this.props.height + 'px',
                    top: (this.props.translateY ? this.props.translateY : this.props.y) + 'px',
                    left: (this.props.translateX ? this.props.translateX : this.props.x) + 'px',
                    padding: 10 + 'px',
                    fontSize: (this.props.height / 2) + 'px',
                    lineHeight: (this.props.height - 20) + 'px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    backgroundColor: this._getBackgroundColorStyle(),
                    color: '#ffffff',
                    cursor: 'default',
                    transform: this._getTransformStyle(),
                    transition: this._getTransitionStyle(),
                    zIndex: this._getZIndexStyle(),
                    boxSizing: 'border-box',
                    borderRadius: '1%',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontWeight: 400
                }}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onClick={this.onClick}
                {...this.dragSourceFor('tile')}
            >
                {this.state.animatingFillScreen ? null : this.props.title}
            </a>
        );
    },

    onMouseEnter: function onMouseEnter() {
        this.setState({
            hover: true
        });
    },

    onMouseLeave: function onMouseLeave() {
        this.setState({
            hover: false
        });
    },

    onClick: function onClick(e) {
        if (!e.shiftKey && !e.metaKey) {
            e.preventDefault();
            this.fillScreen();
        }
    },

    fillScreen: function fillScreen() {
        ReactTransitionEvents.addEndEventListener(this.getDOMNode(), this.onFillScreenTransitionEnd);
        this.setState({
            animatingFillScreen: true,
            translateX: this.props.animationCenterX - this.props.x - (this.props.width / 2),
            translateY: this.props.animationCenterY - this.props.y - (this.props.height / 2),
            scaleX: this.props.animationWidth / this.props.width,
            scaleY: this.props.animationHeight / this.props.height
        });
    },

    onFillScreenTransitionEnd: function onFillScreenTransitionEnd() {
        ReactTransitionEvents.removeEndEventListener(this.getDOMNode(), this.onFillScreenTransitionEnd);
        window.location = this.props.url;
    },

    onDropTransitionEnd: function onDropTransitionEnd() {
        ReactTransitionEvents.removeEndEventListener(this.getDOMNode(), this.onDropTransitionEnd);
        this.setState({
            animatingDrop: false
        });
    },

    _getTransitionStyle: function _getTransitionStyle() {
        if (!this.props.dragging) {
            return [
                'transform 0.25s ease-out',
                'backgroundColor 0.25s ease-in',
                'top 0.25s ease-in-out',
                'left 0.25s ease-in-out',
                'box-shadow 0.2s linear'
            ].join(', ');
        }
    },

    _getTransformStyle: function _getTransformStyle() {
        if (this.state.animatingFillScreen) {
            var translateX = this.state.translateX;
            var translateY = this.state.translateY;
            var scaleX = this.state.scaleX;
            var scaleY = this.state.scaleY;

            return 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scaleX + ', ' + scaleY + ')';
        }
    },

    _getBackgroundColorStyle: function _getTransformStyle() {
        if (this.state.animatingFillScreen) {
            return '#ffffff';
        } else {
            return this.props.backgroundColor;
        }
    },

    _getZIndexStyle: function _getZIndexStyle() {
        if (this.state.animatingFillScreen || this.props.dragging || this.state.animatingDrop) {
            return 2;
        } else {
            return 1;
        }
    }
});

module.exports = Tile;
