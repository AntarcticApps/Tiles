function migrate_1_to_2(callback) {
	function getSitesSize(callback) {
		storage.get('sitesSize', function(sitesSizeItems) {
			if (sitesSizeItems == null || sitesSizeItems.sitesSize == 0) {
				// Something is wrong, save the sites size as zero and callback with null
				
				storage.set({'sitesSize': 0}, function() {
					return callback(0);
				});
			} else {
				return callback(sitesSizeItems.sitesSize);
			}
		});
	}

	// Get all the sites currently in the database
	function getSites(callback) {
		getSitesSize(function(sitesSize) {
			// Ok, we have sites to get...
			// Determine the key for each site, and get the data for that key from the database
			
			if (sitesSize < 0) {
				return callback(null);
			} else if (sitesSize == 0) {
				return callback([]);
			}

			var sitesList = [];
			for (var i = 0; i < sitesSize; i++) {
				sitesList[i] = 'site-' + i;
			}

			// Get the values for the keys from the database
			storage.get(sitesList, function(sitesItems) {
				if (sitesItems == null) {
					// No items exist for some reason
					// Save sites size as zero and callback with null
					
					storage.set({'sitesSize': 0}, function() {
						return callback(null);
					});
				} else {
					// Put all the sites in a array indexed by id

					var sites = [];
					for (var j = 0; j < sitesSize; j++) {
						sites[j] = sitesItems['site-' + j];
					}

					return callback(sites);
				}
			});
		});
	}

	console.log("Migration from 1.x.x to 2.x.x started");

	// Get all the data currently in the database
	getSites(function(sites) {
		storage.clear(function() {
			setStorageVersion({ major: 2, minor: 0, patch: 0 }, function() {
				if (sites != null) {
					addSites(sites, callback);
				} else {
					callback();
				}
			});
		});
	});
}