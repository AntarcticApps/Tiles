describe("Storage", function() {
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

		it("should default to one if it does not exist", function() {
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
				expect(version).toMatch(1);
			});
		});
	});
});