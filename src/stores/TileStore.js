var createStore = require('fluxible-app/utils/createStore');
var React = require('react/addons');
var update = React.addons.update;

var TileStore = createStore({
    storeName: 'TileStore',

    initialize: function initialize() {
        this.tileData = {};
    },

    handlers: {
        'CHANGE_TILE_INDEX': function changeTileIndex(payload) {
            var tileArray = _.values(this.tileData);

            for (var i = 0; i < tileArray.length; i++) {
                var tile = tileArray[i];
                if (payload.newIndex <= tile.sortIndex) {
                    var oldIndex = this.tileData[payload.id].sortIndex;
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

            this.tileData = newTileDataObject;
            this.emitChange();
            this.getContext().dehydrateToLocalStorage(this.getContext());
        }
    },

    getTiles: function getTiles() {
        return this.tileData;
    },

    dehydrate: function dehydrate() {
        return {
            tileData: this.tileData
        };
    },

    rehydrate: function rehydrate(state) {
        this.tileData = state.tileData || this.tileData;
    }
});

module.exports = TileStore;
