describe("A migration", function() {
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

	describe("from v1.x.x to v2.x.x", function() {
		var done;

		beforeEach(function() {
			done = false;
		});

		afterEach(function() {
			ready = false;
		});

		describe("should migrate with 1 site", function() {
			var testSite = {
				url: "http://www.google.com/",
				abbreviation: "Go",
				color: [0, 0, 0, 255]
			};

			beforeEach(function() {
				// Write the v1.x.x database
				runs(function() {
					storage.set({
						"sitesSize": 1,
						"site-0": testSite
					}, function() {
						ready = true;
					});
				});

				waitsFor(function() {
					return ready;
				}, "the v1.x.x database to be set up", 500);

				// Migrate!
				runs(function() {
					migrate_1_to_2(function() {
						done = true;
					});
				});

				waitsFor(function() {
					return done;
				}, "the migration to complete", 500);
			});

			it("should have a database version of 2", function() {
				getStorageVersion(function(version) {
					expect(version).toBe(2);
				});
			});

			it("should not contain any bits from the old database", function() {
				storage.get("sitesSize", function(items) {
					expect(items).toBeEmpty();
				});

				storage.get("site-1", function(items) {
					expect(items).toBeEmpty();
				});
			})

			it("should have 1 site", function() {
				getSitesCount(function(count) {
					expect(count).toBe(1);
				});
			});

			it("should have the correct next ID", function() {
				getNextID(function(id) {
					expect(id).toBe(1);
				});
			});

			it("should have the sorted site ids contain 0", function() {
				getSortedSiteIDs(function(ids) {
					expect(ids.length).toBe(1);
					expect(ids[0]).toBe(0);
				});
			});

			it("should retain the site information", function() {
				getSite(0, function(site) {
					expect(site.url).toEqual(testSite.url);
					expect(site.abbreviation).toEqual(testSite.abbreviation);
					expect(site.color).toEqual(testSite.color);

				});
			});
		});
	});
});