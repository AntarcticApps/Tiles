describe("Storage", function() {
	var oldStorage = null;
	var oldStorageItems = null;
	var ready = false;

	beforeEach(function() {
		oldStorage = storage;
		storage = TEST_STORAGE;

		storage.get(null, function(items) {
			oldStorageItems = items;

			storage.clear(function() {
				ready = true;
			});
		});

		waitsFor(function() {
			return ready;
		}, "the storage to be ready", 500);

		ready = false;
	});

	afterEach(function() {
		storage.set(oldStorageItems, function() {
			storage = oldStorage;

			ready = true;
		});

		waitsFor(function() {
			return ready;
		}, "the storage to be ready", 500);

		ready = false;
	});

	it("should set and get the storage version", function() {
		var done = false;
		var version = null;

		runs(function() {
			setStorageVersion(1261, function() {
				done = true;
			});
		});

		waitsFor(function() {
			return done;
		}, "the storage version to be set", 500);

		runs(function() {
			getStorageVersion(function(v) {
				version = v;
			});
		});

		waitsFor(function() {
			return version;
		}, "the storage version to be gotten", 500);

		runs(function() {
			expect(version).toEqual(1261);
		});
	});
});