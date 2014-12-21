var storage = require('../chrome-integration/storage.js');

var LoadPage = function LoadPage(actionContext, payload, done) {
    storage.getIds(function afterGetIds(ids) {
        done(ids);
    });
}

module.exports = LoadPage;
