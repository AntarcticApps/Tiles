var storage = chrome.storage.sync;
const DEFAULT_STORAGE = chrome.storage.sync;
const TEST_STORAGE = chrome.storage.local;

chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (changes.version) {
		if (changes.version.newValue == undefined
			|| changes.version.newValue == null) {
			setStorageVersion(getExtensionVersion().major);
		}
	}
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
			setStorageVersion(1, function() {
				return callback(1);
			});
			return;
		}

		return callback(items.version);
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

function versionsAreEqual(a, b) {
	return a.major == b.major
		&& a.minor == b.minor
		&& a.patch == b.patch;
}