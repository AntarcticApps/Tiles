var createStore = require('fluxible-app/utils/createStore');
var React = require('react/addons');
var update = React.addons.update;

var exampleTileData = {
    fm: {
        backgroundColor: '#CBA852',
        title: 'Fm',
        url: 'https://fastmail.fm',
        sortIndex: 0,
        id: 'fm'
    },
    gm: {
        backgroundColor: 'red',
        title: 'Gm',
        url: 'https://gmail.com',
        sortIndex: 1,
        id: 'gm'
    },
    fb: {
        backgroundColor: 'blue',
        title: 'Fb',
        url: 'https://facebook.com',
        sortIndex: 2,
        id: 'fb'
    },
    tw: {
        backgroundColor: 'blue',
        title: 'Tw',
        url: 'https://twitter.com',
        sortIndex: 3,
        id: 'tw'
    },
    ap: {
        backgroundColor: 'gray',
        title: 'Ap',
        url: 'https://apple.com',
        sortIndex: 4,
        id: 'ap'
    }
};

var TileStore = createStore({
    storeName: 'TileStore',

    handlers: {
        'CHANGE_TILE_INDEX': function (payload) {
            var tileArray = _.values(exampleTileData);

            for (var i = 0; i < tileArray.length; i++) {
                var tile = tileArray[i];
                if (payload.newIndex <= tile.sortIndex) {
                    var oldIndex = exampleTileData[payload.id].sortIndex;
                    var oldTile = tileArray.splice(oldIndex, 1)[0];
                    tileArray.splice(payload.newIndex, 0, oldTile);
                    break;
                }
            }

            var newTileDataObject = _.reduce(
                tileArray,
                function reduceArrayToObject(accum, tile, i) {
                    accum[tile.id] = update(
                        tile,
                        {
                            sortIndex: {
                                $set: i
                            }
                        }
                    );
                    return accum;
                },
                {}
            );

            exampleTileData = newTileDataObject;

            this.emitChange();
        }
    },

    getTiles: function() {
        return exampleTileData;
    }
});

module.exports = TileStore;
