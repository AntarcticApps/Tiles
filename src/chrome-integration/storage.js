var storage = {
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
    }
};

module.exports = storage;
