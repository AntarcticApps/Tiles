var resetTileData = function resetTileData(actionContext, payload, done) {
    actionContext.dispatch('RESET_TILE_DATA', payload);
    done();
};

module.exports = resetTileData;
