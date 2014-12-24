var createStore = require('fluxible-app/utils/createStore');
var React = require('react/addons');
var update = React.addons.update;
var getWebsiteColor = require('../utils/getWebsiteColor');
var storage = require('../chrome-integration/storage');

var TileStore = createStore({
    storeName: 'TileStore',

    initialize: function initialize() {
        this.bookmarks = {};
        this.tileData = {};
    },

    handlers: {
        'CHANGE_TILE_INDEX': _.throttle(function changeTileIndex(payload) {
            var tileArray = _.sortBy(this.bookmarks, function (t) {
                return t.sortIndex;
            });

            var oldIndex = this.bookmarks[payload.id].sortIndex;

            for (var i = 0; i < tileArray.length; i++) {
                var tile = tileArray[i];
                if (payload.newIndex <= tile.sortIndex) {
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

            storage.moveBookmark(payload.id, payload.newIndex < oldIndex ? payload.newIndex : payload.newIndex + 1);
        }, 100),

        'SET_BOOKMARKS': function setBookmarks(payload) {
            this.bookmarks = payload.bookmarks;
            this.setColorsWithUrls();
        },

        'RESET_TILE_DATA': function resetTileData() {
            this.tileData = {};
            this.setColorsWithUrls();
            this.emitChange();
            this.getContext().dehydrateToLocalStorage(this.getContext());
        }
    },

    setColorsWithUrls: function setColorsWithUrls() {
        _.forEach(this.bookmarks, function (b) {
            getWebsiteColor(b.url, function (color) {
                if (color) {
                    this.tileData[b.id] = this.tileData[b.id] || {};
                    this.tileData[b.id].backgroundColor = color;
                    this.emitChange();
                    this.getContext().dehydrateToLocalStorage(this.getContext());
                }
            }.bind(this));
        }.bind(this));
    },

    getTiles: function getTiles() {
        var merged = {};

        for (var i = 0; i < Object.keys(this.bookmarks).length; i++) {
            var key = Object.keys(this.bookmarks)[i];
            var bookmark = this.bookmarks[key];

            merged[key] = update(
                bookmark,
                {
                    $merge: this.tileData[key] || {}
                }
            );
        }

        return merged;
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
