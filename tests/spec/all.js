var backup = null;

beforeEach(function(done) {
	if (DEFAULT_STORAGE == TEST_STORAGE) {
		// Storage units are the same
		storage.get(null, function(items) {
			backup = items;

			storage.clear(function() {
				storage.get(null, function(items) {
					done();
				});
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
			console.log("before", items);

				storage.clear(function() {
					storage.set(backup, function() {

					storage.get(null, function(items) {
						console.log("after", items);
						done();
					});
				});
			});
		});
	} else {
		// Storage units are not the same
		storage = DEFAULT_STORAGE;
	}
});