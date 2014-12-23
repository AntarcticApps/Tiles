var storage = require('../chrome-integration/storage.js');

var loadPage = function loadPage(actionContext, payload, done) {
    storage.getIds(function afterGetIds(ids) {
        done(ids);
    });
}

module.exports = loadPage;
