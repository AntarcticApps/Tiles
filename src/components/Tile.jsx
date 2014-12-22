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
                    top: this.props.y + 'px',
                    left: this.props.x + 'px',
                    padding: 10 + 'px',
                    fontSize: (this.props.height / 2) + 'px',
                    lineHeight: this.props.height + 'px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    backgroundColor: this._getBackgroundColorStyle(),
                    boxShadow: this._getBoxShadowStyle(),
                    color: '#ffffff',
                    textShadow: '0 2px 0 rgba(0, 0, 0, 0.2)',
                    cursor: 'default',
                    transform: this._getTransformStyle(),
                    transition: this._getTransitionStyle(),
                    zIndex: this._getZIndexStyle(),
                    boxSizing: 'border-box'
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

    _getBoxShadowStyle: function _getBoxShadowStyle() {
        if (this.state.hover) {
            return '0 0 0 1px rgba(0, 0, 0, 0.15), inset 0 0 0 2px rgba(255, 255, 255, 0.4)';
        } else {
            return '0 0 0 1px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.2)';
        }
    },

    _getTransitionStyle: function _getTransitionStyle() {
        if (this.state.animatingFillScreen || this.state.animatingDrop) {
            return 'transform 0.25s ease-out, backgroundColor 0.25s ease-in';
        }
    },

    _getTransformStyle: function _getTransformStyle() {
        if (this.state.animatingFillScreen) {
            var translateX = this.state.translateX;
            var translateY = this.state.translateY;
            var scaleX = this.state.scaleX;
            var scaleY = this.state.scaleY;

            return 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scaleX + ', ' + scaleY + ')';
        } else if (this.props.translateX && this.props.translateY) {
            return 'translate(' + this.props.translateX + 'px, ' + this.props.translateY + 'px)';
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
        if (this.state.animatingFillScreen || this.state.dragging || this.state.animatingDrop) {
            return 2;
        } else {
            return 1;
        }
    }
});

module.exports = Tile;
