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