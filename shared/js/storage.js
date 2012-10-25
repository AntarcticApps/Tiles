var storage = chrome.storage.sync;
const DEFAULT_STORAGE = chrome.storage.sync;
const TEST_STORAGE = chrome.storage.local;

var count = 0;
chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (areaName == "sync")
		console.log(++count, changes);
});

/**
 * Reset the storage to the default storage for normal use.
 */
function resetStorageToDefault() {
	storage = DEFAULT_STORAGE;
}

/**
 * Get the version of the storage.
 * @param  {Function} callback Function taking in a version
 */
function getStorageVersion(callback) {
	storage.get('version', function(items) {
		if (!items || !items.version) {
			return callback({
				major: 1,
				minor: 0,
				patch: 0
			});
		} else {
			return callback(items.version);
		}
	});
}

/**
 * Set the storage to a version.
 * @param {int}      version  Some version
 * @param {Function} callback
 */
function setStorageVersion(version, callback) {
	storage.set({ 'version': version }, callback);
}

function storageVersionExists(callback) {
	storage.get('version', function(items) {
		return callback(!items || !items.version);
	});
}

function versionsAreEqual(a, b) {
	if (!a || !b) {
		return false;
	}
	
	return a.major == b.major
		&& a.minor == b.minor
		&& a.patch == b.patch;
}