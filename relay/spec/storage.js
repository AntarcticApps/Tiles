describe("Storage", function() {
	it("should be empty for each test", function() {
		var items, ready;

		runs(function() {
			ready = false;

			storage.get(null, function(i) {
				items = i;

				ready = true;
			});
		});

		waitsFor(function() {
			return ready;
		}, "all the items in storage to be gotten", 500);

		runs(function() {
			expect(items).toEqual({});
		});
	});

	it("should be using the test storage", function() {
		expect(storage).toEqual(TEST_STORAGE);
		expect(storage).toNotEqual(DEFAULT_STORAGE);
	});

	describe("version", function() {
		it("should be able to be set and get", function() {
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

		it("should default to 1.0.0 if it does not exist", function() {
			var version = null;

			runs(function() {
				getStorageVersion(function(v) {
					version = v;
				});
			});

			waitsFor(function() {
				return version != null;
			}, "the storage version to be gotten", 500);

			runs(function() {
				expect(version).toEqual({
					major: 1,
					minor: 0,
					patch: 0
				});
			});
		});
	});
});