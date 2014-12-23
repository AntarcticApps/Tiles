var React = require('react/addons');
var TileGrid = require('./TileGrid.jsx');

var TilesApp = React.createClass({
    render: function render() {
        return (
            <div
                style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    height: '100%',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
            >
                <TileGrid
                    context={this.props.context}
                />
            </div>
        );
    }
});

module.exports = TilesApp;
