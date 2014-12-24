var React = require('react/addons');
var TileGrid = require('./TileGrid.jsx');
var changeBackgroundColorAction = require('../actions/changeBackgroundColor');
var ApplicationStore = require('../stores/ApplicationStore');
var StoreMixin = require('fluxible-app').StoreMixin;

var MARGIN = 8;
var BUTTON_HEIGHT = 30;

var TilesApp = React.createClass({
    mixins: [StoreMixin],

    statics: {
        storeListeners: [ApplicationStore]
    },

    getInitialState: function getInitialState() {
        return {
            backgroundColor: this.getStore(ApplicationStore).getBackgroundColor()
        }
    },

    onChange: function onChange() {
        this.setState({
            backgroundColor: this.getStore(ApplicationStore).getBackgroundColor()
        });
    },

    render: function render() {
        return (
            <div
                style={{
                    backgroundColor: this.state.backgroundColor,
                    width: '100%',
                    height: '100%',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
            >
                <canvas
                    style={{
                        display: 'none'
                    }}
                />

                <input
                    id="color-picker"
                    type="color"
                    style={{
                        visibility: 'hidden',
                        position: 'absolute'
                    }}
                    onChange={this.onColorInputChange}
                />

                <TileGrid
                    context={this.props.context}
                />
            </div>
        );
    },

    onColorInputChange: function onColorInputChange(e) {
        var target = e.target;
        var color = target.value;

        this.props.context.executeAction(
            changeBackgroundColorAction,
            {
                backgroundColor: color
            }
        );
    }
});

module.exports = TilesApp;
