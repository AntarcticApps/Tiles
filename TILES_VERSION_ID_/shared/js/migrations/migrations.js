/**
 * Migrates the database from one version to another.
 */
function migrateStorage() {
	var extensionVersion = getExtensionVersion();

	chrome.storage.sync.get(null, function(syncItems) {
		var storageIsEmpty = Object.keys(syncItems).length == 0;

		if (!storageIsEmpty) {
			chrome.storage.sync.clear(function() {
				storage.set(syncItems, function() {
					migrateIfNeeded();
				});
			});
		} else {
			migrateIfNeeded();
		}
	});

	function migrateIfNeeded(callback) {
		if (!callback) {
			callback = function() { };
		}

		storage.get(null, function(items) {
			var storageIsEmpty = Object.keys(items).length == 0;

			if (!storageIsEmpty) {
				getStorageVersion(function(storageVersion) {
					console.log("storage version: %s.%s.%s, extension version: %s.%s.%s",
							storageVersion.major,
							storageVersion.minor,
							storageVersion.patch,
							extensionVersion.major,
							extensionVersion.minor,
							extensionVersion.patch);

					if (!versionsAreEqual(extensionVersion, storageVersion)) {
						setStorageVersion(extensionVersion);
						console.log("Migration may be needed - version did change");
						handleMigrationFromTo(storageVersion, extensionVersion);
						return callback(true);
					} else {
						console.log("Migration is not needed - version did not change");
						return callback(false);
					}
				});
			} else {
				console.log("Migration is not needed - new install");
				return callback(false);
			}
		});
	}

	function handleMigrationFromTo(storageVersion, extensionVersion) {
		if (storageVersion.major == 1) {
			if (extensionVersion.major == 2) {
				// Migrate from a database from 1.x.x to 2.x.x
				migrate_1_to_2(function() {
					console.log("Migration from 1.x.x to 2.x.x complete");
					emitMessage("refresh");

					showUpdateNotification();
				});
			}
		}
	}

	function showUpdateNotification() {
		var notification = webkitNotifications.createHTMLNotification('/TILES_VERSION_ID_/notifications/new.html');
		notification.show();
	}
}