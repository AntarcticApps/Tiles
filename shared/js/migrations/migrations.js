/**
 * Migrates the database from one version to another.
 */
function migrateStorage() {
	var extensionVersion = getExtensionVersion();

	getStorageVersion(function(storageVersion) {
		if (!versionsAreEqual(extensionVersion, storageVersion)) {
			console.log("Extension and storage versions are not equal", extensionVersion, storageVersion);
			setStorageVersion(extensionVersion);

			if (storageVersion.major == 1) {
				if (extensionVersion.major == 2) {
					// Migrate from a database from 1.x.x to 2.x.x
					migrate_1_to_2(function() {
						console.log("Migration from 1.x.x to 2.x.x complete");
					});
				}
			}
		}
	});
}