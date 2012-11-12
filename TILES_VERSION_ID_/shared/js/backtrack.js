chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (didVersionBacktrack(changes)) {
		revertChanges(changes, null);
	}
});

/**
 * Detect if the version changed from a new version to an older version
 * @param  {Object}		Object of changes (provided from chrome.storage.onChanged listener)
 * @return {boolean}	Whether or not the version backtracked
 */
function didVersionBacktrack(changes) {
	var version = changes.version;

	if (typeof version !== 'undefined') {
		if (version.oldValue instanceof Object) {
			if (version.newValue.major < version.oldValue.major) {
				return true;
			}
		} else {
			if (version.newValue.major < version.oldValue) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Revert changes from a changes object.
 * @param  {Object}		Object of changes (provided from chrome.storage.onChanged listener)
 * @param  {Function}	Completion callback
 */
function revertChanges(changes, callback) {
	var data = {};

	for (key in changes) {
		data[key] = changes[key].oldValue;
	}

	storage.set(data, callback);
}