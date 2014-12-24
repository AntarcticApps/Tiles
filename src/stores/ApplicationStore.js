var createStore = require('fluxible-app/utils/createStore');
var _ = require('lodash');

var ApplicationStore = createStore({
    storeName: 'ApplicationStore',

    initialize: function initialize() {
        this.backgroundColor = '#fffffff';
    },

    handlers: {
        'CHANGE_BACKGROUND_COLOR': _.throttle(function changeTileIndex(payload) {
            this.backgroundColor = payload.backgroundColor;
            this.emitChange();
            this.getContext().dehydrateToLocalStorage(this.getContext());
        }, 100)
    },

    getBackgroundColor: function getBackgroundColor() {
        return this.backgroundColor;
    },

    dehydrate: function dehydrate() {
        return {
            backgroundColor: this.backgroundColor
        };
    },

    rehydrate: function rehydrate(state) {
        this.backgroundColor = state.backgroundColor || this.backgroundColor;
    }
});

module.exports = ApplicationStore;
