var storage = require('../chrome-integration/storage.js');

var loadPage = function loadPage(actionContext, payload, done) {
    storage.getBookmarks(function bookmarksCallback(bookmarks) {
        actionContext.dispatch('SET_BOOKMARKS', {
            bookmarks: bookmarks
        });

        done();
    });

    storage.subscribeToBookmarkEvents(function bookmarkEventCallback() {
        storage.getBookmarks(function bookmarksCallback(bookmarks) {
            actionContext.dispatch('SET_BOOKMARKS', {
                bookmarks: bookmarks
            });
        });
    });
}

module.exports = loadPage;
