var backup = null;

beforeEach(function(done) {
	if (DEFAULT_STORAGE == TEST_STORAGE) {
		// Storage units are the same
		storage.get(null, function(items) {
			backup = items;

			storage.clear(function() {
				done();
			});
		});
		
	} else {
		// Storage units are not the same
		storage = TEST_STORAGE;

		storage.clear(function() {
			done();
		});
	}
});

afterEach(function(done) {
	if (DEFAULT_STORAGE == TEST_STORAGE) {
		// Storage units are the same
		
		storage.get(null, function(items) {
			storage.clear(function() {
				storage.set(backup, function() {
					writeUserStylesheet();
					done();
				});
			});
		});
	} else {
		// Storage units are not the same
		storage = DEFAULT_STORAGE;
	}
});