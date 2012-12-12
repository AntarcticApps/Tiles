describe("Storage", function() {
	it("should be empty for each test", function() {
		var items;

		runs(function(done) {
			storage.get(null, function(i) {
				items = i;
				done();
			});
		});

		runs(function(done) {
			expect(items).toEqual({});
			done();
		});
	});

	it("should be using the test storage", function() {
		expect(storage).toEqual(TEST_STORAGE);

		if (TEST_STORAGE != DEFAULT_STORAGE) {
			expect(storage).toNotEqual(DEFAULT_STORAGE);
		}
	});

	describe("version", function() {
		it("should be able to be set and get", function() {
			var version = null;

			runs(function(done) {
				setStorageVersion(1261, function() {
					done();
				});
			});

			runs(function(done) {
				getStorageVersion(function(v) {
					version = v;
					done();
				});
			});

			runs(function(done) {
				expect(version).toEqual(1261);
				done();
			});
		});

		it("should default to 1.0.0 if it does not exist", function() {
			var version = null;

			runs(function(done) {
				getStorageVersion(function(v) {
					version = v;
					done();
				});
			});

			runs(function(done) {
				expect(version).toEqual({
					major: 1,
					minor: 0,
					patch: 0
				});
				done();
			});
		});
	});
});