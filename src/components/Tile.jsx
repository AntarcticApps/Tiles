var React = require('react/addons');
var ReactTransitionEvents = require('react/lib/ReactTransitionEvents');

var CHANGE_LOCATION_DELAY = 300;

var Tile = React.createClass({
    propTypes: {
        backgroundColor: React.PropTypes.string,
        title: React.PropTypes.string,
        url: React.PropTypes.string,
        shouldAnimate: React.PropTypes.bool,
        animationTransforms: React.PropTypes.object,
        onClick: React.PropTypes.func
    },

    getDefaultProps: function getDefaultProps() {
        return {
            backgroundColor: 'white',
            title: null,
            url: null,
            shouldAnimate: false,
            animationTransforms: {},
            onClick: function() {}
        };
    },

    getInitialState: function getInitialState() {
        return {
            hover: false
        };
    },

    render: function render() {
        return (
            <a
                href={this.props.url}
                style={{
                    display: 'inline-block',
                    position: 'relative',
                    width: 200 + 'px',
                    height: 200 + 'px',
                    padding: 10 + 'px',
                    margin: 4 + 'px',
                    fontSize: 100 + 'px',
                    lineHeight: 200 + 'px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    backgroundColor: this._getBackgroundColorStyle(),
                    boxShadow: this._getBoxShadowStyle(),
                    color: '#ffffff',
                    textShadow: '0 2px 0 rgba(0, 0, 0, 0.2)',
                    cursor: 'default',
                    transform: this._getTransformStyle(),
                    transition: 'transform 0.25s ease-in, backgroundColor 0.25s ease-in',
                    zIndex: this._getZIndexStyle()
                }}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onClick={this.onClick}
            >
                {this.props.shouldAnimate ? null : this.props.title}
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
            this.props.onClick();
            ReactTransitionEvents.addEndEventListener(this.getDOMNode(), this.onTransitionEnd);
        }
    },

    onTransitionEnd: function onTransitionEnd() {
        window.location = this.props.url;
    },

    _getBoxShadowStyle: function _getBoxShadowStyle() {
        if (this.state.hover) {
            return '0 0 0 1px rgba(0, 0, 0, 0.15), inset 0 0 0 2px rgba(255, 255, 255, 0.4)';
        } else {
            return '0 0 0 1px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.2)';
        }
    },

    _getTransformStyle: function _getTransformStyle() {
        if (this.props.shouldAnimate) {
            var transforms = this.props.animationTransforms;
            var translateX = transforms.translateX;
            var translateY = transforms.translateY;
            var scaleX = transforms.scaleX;
            var scaleY = transforms.scaleY;

            return 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scaleX + ', ' + scaleY + ')';
        }
    },

    _getBackgroundColorStyle: function _getTransformStyle() {
        if (this.props.shouldAnimate) {
            return '#ffffff';
        } else {
            return this.props.backgroundColor;
        }
    },

    _getZIndexStyle: function _getZIndexStyle() {
        if (this.props.shouldAnimate) {
            return 2;
        } else {
            return 1;
        }
    }
});

module.exports = Tile;
