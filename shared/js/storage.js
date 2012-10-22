var storage = chrome.storage.sync;
const DEFAULT_STORAGE = chrome.storage.sync;
const TEST_STORAGE = chrome.storage.local;

function resetStorageToDefault() {
	storage = DEFAULT_STORAGE;
}