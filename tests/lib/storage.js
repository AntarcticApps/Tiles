var ready;
var backup;

beforeEach(function() {
	ready = false;

	runs(function() {
		if (DEFAULT_STORAGE == TEST_STORAGE) {
			// Storage units are the same
			storage.get(null, function(items) {
				backup = items;

				storage.clear(function() {
					ready = true;
				});
			});
			
		} else {
			// Storage units are not the same
			storage = TEST_STORAGE;

			storage.clear(function() {
				ready = true;
			});
		}
	});

	waitsFor(function() {
		return ready;
	}, "the storage to be set up for testing", 500);
});

afterEach(function() {
	ready = false;

	runs(function() {
		if (DEFAULT_STORAGE == TEST_STORAGE) {
			// Storage units are the same
			storage.clear(function() {
				storage.set(backup, function() {
					ready = true;
				});
			});
		} else {
			// Storage units are not the same
			storage = DEFAULT_STORAGE;

			ready = true;
		}
	});

	waitsFor(function() {
		return ready;
	}, "the storage to be set up for normal use", 500);
});