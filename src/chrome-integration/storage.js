var React = require('react/addons');
var update = React.addons.update;

var storage = {
    getBookmarks: function getBookmarks(callback) {
        chrome.bookmarks.getSubTree('1', function bookmarksCallback(bookmarkTree) {
            if (bookmarkTree) {
                var transformedBookmarks = bookmarkTree[0].children.reduce(
                    function mapBookmarkToTile(accum, bookmark) {
                        if (bookmark.url) {
                            accum[bookmark.id] = {
                                sortIndex: bookmark.index,
                                title: bookmark.title,
                                url: bookmark.url,
                                id: bookmark.id
                            };
                        }

                        return accum;
                    },
                    {}
                );

                var bookmarksArray = _.sortBy(transformedBookmarks, function (b) {
                    return b.sortIndex;
                });

                var filteredBookmarks = _.reduce(
                    bookmarksArray,
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

                return callback(filteredBookmarks);
            }
        });
    },

    load: function load(callback) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get('data', function storageCallback(items) {
                return callback(items && items.data);
            });
        } else {
            callback();
        }
    },

    store: function store(data, callback) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set(
                {
                    'data': data
                },
                function (items) {
                    if (callback) {
                        return callback(true);
                    }
                }
            );
        } else {
            if (callback) {
                callback(false);
            }
        }
    },

    moveBookmark: function moveBookmark(id, newIndex) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.bookmarks.move(
                id,
                {
                    index: newIndex
                }
            );
        }
    },

    subscribeToContextualMenuEvents: function subscribeToContextualMenuEvents() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.contextMenus.removeAll(function() {
                console.log(chrome.i18n.getMessage('change_background_color'));
                chrome.contextMenus.create({
                    title: chrome.i18n.getMessage('change_background_color'),
                    documentUrlPatterns: [chrome.extension.getURL("/") + "*"],
                    contexts: ['page', 'link'],
                    onclick: function onContextMenuClick() {
                        var d = document.getElementById('color-picker');
                        d.click();
                    }
                });
            });
        }
    }
};

module.exports = storage;
