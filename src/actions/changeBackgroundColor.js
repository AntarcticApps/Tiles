var changeBackgroundColor = function changeBackgroundColor(actionContext, payload, done) {
    actionContext.dispatch('CHANGE_BACKGROUND_COLOR', payload);
    done();
};

module.exports = changeBackgroundColor;
