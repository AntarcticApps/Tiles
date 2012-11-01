/**
 * Migrates the database from one version to another.
 */
function migrateStorage() {
	var extensionVersion = getExtensionVersion();

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
					console.log("Migration may be needed - version did change");
					setStorageVersion(extensionVersion);

					if (storageVersion.major == 1) {
						if (extensionVersion.major == 2) {
							// Migrate from a database from 1.x.x to 2.x.x
							migrate_1_to_2(function() {
								console.log("Migration from 1.x.x to 2.x.x complete");
								emitMessage("refresh");
							});
						}
					}

					var notification = webkitNotifications.createHTMLNotification('/TILES_VERSION_ID_/notifications/new.html');
					notification.show();
				} else {
					console.log("Migration is not needed - version did not change");
				}
			});
		} else {
			console.log("Migration is not needed - new install");
			setStorageVersion(extensionVersion);
		}
	});
}