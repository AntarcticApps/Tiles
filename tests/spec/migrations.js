describe("A migration", function() {
	describe("from v1.x.x to v2.x.x", function() {
		describe("should migrate with a negative sites size", function() {
			beforeEach(function(done) {
				// Write the v1.x.x database
				storage.set({
					"sitesSize": -1,
				}, function() {
					migrate_1_to_2(function() {
						done();
					});
				});
			});

			it("should have the correct database version", function() {
				runs(function(done) {
					getStorageVersion(function(version) {
						expect(version).toEqual({ major: 2, minor: 0, patch: 0 });
						done();
					});
				});
			});

			it("should not contain any bits from the old database", function() {
				runs(function(done) {
					storage.get("sitesSize", function(items) {
						expect(items).toEqual({});
						done();
					});
				});
			})

			it("should have no sites", function() {
				runs(function(done) {
					getSitesCount(function(count) {
						expect(count).toBe(0);
						done();
					});
				});
			});

			it("should have the next ID be 0", function() {
				runs(function(done) {
					getNextID(function(id) {
						expect(id).toBe(0);
						done();
					});
				});
			});

			it("should have an empty sorted site ids", function() {
				runs(function(done) {
					getSortedSiteIDs(function(ids) {
						expect(ids).toEqual([]);
						done();
					});
				});
			});
		});

		describe("should migrate with no sites", function() {
			beforeEach(function(done) {
				// Write the v1.x.x database
				storage.set({
					"sitesSize": 0,
				}, function() {
					migrate_1_to_2(function() {
						done();
					});
				});
			});

			it("should have the correct database version", function() {
				runs(function(done) {
					getStorageVersion(function(version) {
						expect(version).toEqual({ major: 2, minor: 0, patch: 0 });
						done();
					});
				});
			});

			it("should not contain any bits from the old database", function() {
				runs(function(done) {
					storage.get("sitesSize", function(items) {
						expect(items).toEqual({});
						done();
					});
				});
			})

			it("should have no sites", function() {
				runs(function(done) {
					getSitesCount(function(count) {
						expect(count).toBe(0);
						done();
					});
				});
			});

			it("should have the next ID be 0", function() {
				runs(function(done) {
					getNextID(function(id) {
						expect(id).toBe(0);
						done();
					});
				});
			});

			it("should have an empty sorted site ids", function() {
				runs(function(done) {
					getSortedSiteIDs(function(ids) {
						expect(ids).toEqual([]);
						done();
					});
				});
			});
		});

		describe("should migrate with 1 site", function() {
			var testSite = {
				url: "http://www.google.com/",
				abbreviation: "Go",
				color: [0, 0, 0, 255]
			};

			beforeEach(function(done) {
				// Write the v1.x.x database
				storage.set({
					"sitesSize": 1,
					"site-0": testSite
				}, function() {
					migrate_1_to_2(function() {
						done();
					});
				});
			});

			it("should have the correct database version", function() {
				runs(function(done) {
					getStorageVersion(function(version) {
						expect(version).toEqual({ major: 2, minor: 0, patch: 0 });
						done();
					});
				});
			});

			it("should not contain any bits from the old database", function() {
				runs(function(done) {
					storage.get("sitesSize", function(items) {
						expect(items).toEqual({});
						done();
					});
				});

				runs(function(done) {
					storage.get("site-1", function(items) {
						expect(items).toEqual({});
						done();
					});
				});
			})

			it("should have 1 site", function() {
				runs(function(done) {
					getSitesCount(function(count) {
						expect(count).toBe(1);
						done();
					});
				});
			});

			it("should have the correct next ID", function() {
				runs(function(done) {
					getNextID(function(id) {
						expect(id).toBe(1);
						done();
					});
				});
			});

			it("should have the sorted site ids contain the only site", function() {
				runs(function(done) {
					getSortedSiteIDs(function(ids) {
						expect(ids.length).toBe(1);
						expect(ids[0]).toBe(0);
						done();
					});
				});
			});

			it("should retain the site information", function() {
				runs(function(done) {
					getSite(0, function(site) {
						expect(site.url).toEqual(testSite.url);
						expect(site.abbreviation).toEqual(testSite.abbreviation);
						expect(site.color).toEqual(testSite.color);
						done();
					});
				});
			});
		});

		describe("should migrate with multiple site", function() {
			var testSites = [{
				url: "http://www.google.com/",
				abbreviation: "Go",
				color: [0, 0, 0, 255]
			}, {
				url: "http://www.antarcticapps.com/",
				abbreviation: "Aa",
				color: [0, 0, 255, 255]
			}];

			beforeEach(function(done) {
				// Write the v1.x.x database
				storage.set({
					"sitesSize": 2,
					"site-0": testSites[0],
					"site-1": testSites[1]
				}, function() {
					migrate_1_to_2(function() {
						done();
					});
				});
			});

			it("should have the correct database version", function() {
				runs(function(done) {
					getStorageVersion(function(version) {
						expect(version).toEqual({ major: 2, minor: 0, patch: 0 });
						done();
					});
				});
			});

			it("should not contain any bits from the old database", function() {
				runs(function(done) {
					storage.get("sitesSize", function(items) {
						expect(items).toEqual({});
						done();
					});
				});

				runs(function(done) {
					storage.get("site-0", function(items) {
						expect(items).toEqual({});
						done();
					});
				});

				runs(function(done) {
					storage.get("site-1", function(items) {
						expect(items).toEqual({});
						done();
					});
				});
			})

			it("should have correct number of sites", function() {
				runs(function(done) {
					getSitesCount(function(count) {
						expect(count).toBe(2);
						done();
					});
				});
			});

			it("should have the correct next ID", function() {
				runs(function(done) {
					getNextID(function(id) {
						expect(id).toBe(2);
						done();
					});
				});
			});

			it("should have the sorted site ids contain the only site", function() {
				runs(function(done) {
					getSortedSiteIDs(function(ids) {
						expect(ids.length).toBe(2);
						expect(ids[0]).toBe(0);
						expect(ids[1]).toBe(1);
						done();
					});
				});
			});

			it("should retain the site information", function() {
				runs(function(done) {
					getSite(0, function(site) {
						expect(site.url).toEqual(testSites[0].url);
						expect(site.abbreviation).toEqual(testSites[0].abbreviation);
						expect(site.color).toEqual(testSites[0].color);
						done();
					});
				});

				runs(function(done) {
					getSite(1, function(site) {
						expect(site.url).toEqual(testSites[1].url);
						expect(site.abbreviation).toEqual(testSites[1].abbreviation);
						expect(site.color).toEqual(testSites[1].color);
						done();
					});
				});
			});
		});
	});
});