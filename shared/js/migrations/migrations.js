/**
 * Migrates the database from one version to another.
 */
function migrateStorage() {
	var extensionVersion = getExtensionVersion().major;

	console.log("Checking to see if a migration is needed...");

	getStorageVersion(function(storageVersion) {
		if (extensionVersion != storageVersion) {
			console.log("Migration needed - storage is at v" + storageVersion + "; extension is at v" + extensionVersion);
			setStorageVersion(extensionVersion);

			if (storageVersion == 1) {
				if (extensionVersion == 2) {
					// Migrate from a database from 1.x.x to 2.x.x
					migrate_1_to_2(function() {
						console.log("Migration from 1.x.x to 2.x.x complete");
						emitMessage("refresh");
					});
				}
			}
		}
	});
}