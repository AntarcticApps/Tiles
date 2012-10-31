/**
 * Migrates the database from one version to another.
 */
function migrateStorage() {
	var extensionVersion = getExtensionVersion();

	getStorageVersion(function(storageVersion) {
		console.log("Check to see if a migration is needed: storage is at %s.%s.%s, extension is at %s.%s.%s",
				storageVersion.major,
				storageVersion.minor,
				storageVersion.patch,
				extensionVersion.major,
				extensionVersion.minor,
				extensionVersion.patch);

		if (!versionsAreEqual(extensionVersion, storageVersion)) {
			console.log("Migration is needed");
			setStorageVersion(extensionVersion);

			if (storageVersion.major == 1) {
				if (extensionVersion.major == 2) {
					// Migrate from a database from 1.x.x to 2.x.x
					migrate_1_to_2(function() {
						console.log("Migration from 1.x.x to 2.x.x complete");
						emitMessage("refresh");

						var notification = webkitNotifications.createNotification(
						  '/TILES_VERSION_ID_/icons/icon-small.png',
						  'Tiles Updated',
						  'Lorem ipsum...'
						);

						notification.show();
					});
				}
			}
		} else {
			console.log("Migration is not needed");
		}
	});
}