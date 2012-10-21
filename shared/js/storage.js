var storage = chrome.storage.sync;

function clearStorage(callback) {
	storage.clear(callback);
}
