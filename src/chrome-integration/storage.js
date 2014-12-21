var storage = {
    getIds: function(callback) {
        chrome.storage.local.get('ids', function (items) {
            return callback(items && items.ids);
        });
    }
};

module.exports = storage;
