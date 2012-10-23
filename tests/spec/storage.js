describe("Storage", function() {
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

	it("should always have the version", function() {
		var version = null;

		runs(function() {
			storage.clear(function() {
				storage.get("version", function(v) {
					version = v.version;
				});
			});
		});

		waitsFor(function() {
			return version != null;
		}, "the storage version to be gotten", 500);

		runs(function() {
			expect(version).toMatch(setStorageVersion());
		});
	});
});