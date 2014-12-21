var React = require('react/addons');
var TileGrid = require('./TileGrid.jsx');

var exampleTileData = [
    {
        backgroundColor: '#CBA852',
        title: 'Fm',
        url: 'https://fastmail.fm'
    },
    {
        backgroundColor: 'red',
        title: 'Gm',
        url: 'https://gmail.com'
    }
];

var TilesApp = React.createClass({
    render: function render() {
        return (
            <div
                style={{
                    backgroundColor: '#005493',
                    width: '100%',
                    height: '100%',
                    fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif',
                }}
            >
                <TileGrid
                    tileData={exampleTileData}
                />
            </div>
        );
    }
});

module.exports = TilesApp;
