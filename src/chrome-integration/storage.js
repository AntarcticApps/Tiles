var storage = {
    getIds: function(callback) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get('ids', function (items) {
                return callback(items && items.ids);
            });
        } else {
            callback();
        }
    }
};

module.exports = storage;
