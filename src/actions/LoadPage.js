var storage = require('../chrome-integration/storage.js');

var loadPage = function loadPage(actionContext, payload, done) {
    storage.getBookmarks(function bookmarksCallback(bookmarks) {
        actionContext.dispatch('SET_BOOKMARKS', {
            bookmarks: bookmarks
        });

        done();
    });
}

module.exports = loadPage;
