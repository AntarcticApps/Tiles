/**
 * Migrates the database from one version to another.
 */
function migrateDatabase() {
	var extensionVersion = getExtensionVersion();

	getStorageVersion(function (storageVersion) {
		if (storageVersion == 1) {
			if (extensionVersion.major == 2) {
				// Migrate from a database from 1.x.x to 2.x.x
				migrate_1_to_2(function() {
					console.log("Migration complete.");
				});
			}
		}
	});
}

/**
 * Get the version of the storage.
 * @param  {Function} callback Function taking in a version
 */
function getStorageVersion(callback) {
	storage.get('version', function(items) {
		if (!items || !items.version) {
			return callback(1);
		}

		return callback(items.version);
	});
}

/**
 * Get the version of the extension.
 * @return {Object} Object with major, minor, and patch fields
 */
function getExtensionVersion() {
	var details = chrome.app.getDetails();
	var versionString = details.version;

	var array = versionString.split('.');

	var version = {
		major: array[0],
		minor: array[1],
		patch: array[2]
	}

	return version;
}