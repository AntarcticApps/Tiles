chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (didVersionBacktrack(changes)) {
		revertChanges(changes, null);
	}
});

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

function revertChanges(changes, callback) {
	var data = {};

	for (key in changes) {
		data[key] = changes[key].oldValue;
	}

	storage.set(data, callback);
}