var changeTileIndex = function changeTileIndex(actionContext, payload, done) {
    actionContext.dispatch('CHANGE_TILE_INDEX', payload);
    done();
}

module.exports = changeTileIndex;
