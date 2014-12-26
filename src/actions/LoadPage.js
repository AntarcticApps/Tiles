var bookmarks = require('../chrome-integration/bookmarks.js');

var loadPage = function loadPage(actionContext, payload, done) {
    bookmarks.getBookmarks(function bookmarksCallback(bookmarks) {
        actionContext.dispatch('SET_BOOKMARKS', {
            bookmarks: bookmarks
        });

        done();
    });

    bookmarks.subscribeToBookmarkEvents(function bookmarkEventCallback() {
        bookmarks.getBookmarks(function bookmarksCallback(bookmarks) {
            actionContext.dispatch('SET_BOOKMARKS', {
                bookmarks: bookmarks
            });
        });
    });
}

module.exports = loadPage;
