describe("A site", function() {
	var server;

	beforeEach(function() {
		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		server.restore();
	});

	describe("object", function() {
		describe("should be created", function() {
			it("given a color", function() {
				var site = null;
				var url = "http://www.antarcticapps.com/";
				var abbreviation = "Aa";

				runs(function() {
					createSite(url, abbreviation, [1, 4, 9, 255], function(s) {
						site = s;
					});
				});

				waitsFor(function() {
					return site != null;
				}, "the site to be created", 500);

				runs(function() {
					expect(site).toEqual({
						url: url,
						abbreviation: abbreviation,
						color: {
							red: 1,
							green: 4,
							blue: 9,
							alpha: 255
						}
					});
				});
			});

			it("with a bad URL", function() {
				var site = null;
				var url = "/";
				var abbreviation = "Aa";

				runs(function() {
					createSite(url, abbreviation, null, function(s) {
						site = s;
					});

					server.respond();
				});

				waitsFor(function() {
					return site != null;
				}, "the site to be created", 5000);

				runs(function() {
					expect(site).toEqual({
						url: url,
						abbreviation: abbreviation,
						color: {
							red: 0,
							green: 0,
							blue: 0,
							alpha: 255
						}
					});
				});
			});

			it("with a good URL", function() {
				server.restore();

				var site = null;
				var url = "http://www.antarcticapps.com/";
				var abbreviation = "Aa";

				runs(function() {
					createSite(url, abbreviation, null, function(s) {
						site = s;
					});
				});

				waitsFor(function() {
					return site != null;
				}, "the site to be created", 5000);

				runs(function() {
					expect(site).toEqual({
						url: url,
						abbreviation: abbreviation,
						color: {
							red: 181,
							green: 209,
							blue: 226,
							alpha: 255
						}
					});
				});
			});
		});

		describe("should be able to be assigned a color", function() {
			var site;

			beforeEach(function() {
				site = {};
			});

			it("given a non-null color", function() {
				setSiteColor(site, [0, 1, 4, 9]);

				expect(site.color).toEqual({
					red: 0,
					green: 1,
					blue: 4,
					alpha: 9
				});
			});

			it("given a null color", function() {
				setSiteColor(site, null);

				expect(site.color).toEqual({
					red: 0,
					green: 0,
					blue: 0,
					alpha: 255
				});
			});
		});
	});

	describe("in storage", function() {

	});
});

describe("Site storage", function() {
	var oldStorage = null;
	var oldStorageItems = null;
	var ready = false;
	var server = null;

	beforeEach(function() {
		oldStorage = storage;
		storage = TEST_STORAGE;

		server = sinon.fakeServer.create();

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
		server.restore();
	});

	describe("when requesting a next ID", function() {
		it("should default to zero", function() {
			var id = null;

			runs(function() {
				getNextID(function(i) {
					id = i;
				});
			});
			
			waitsFor(function() {
				return id != null;
			}, "the ID to be set", 500);

			runs(function() {
				expect(id).toBe(0);
			});
		});

		it("should increment after multiple calls", function() {
			var id = null;

			runs(function() {
				getNextID(function(i) {
					getNextID(function(j) {
						id = j;
					});
				});
			});
			
			waitsFor(function() {
				return id != null;
			}, "the ID to be set", 500);

			runs(function() {
				expect(id).toBe(1);
			});
		});
	});

	describe("when storing a new site", function() {
		var id, site;

		describe("using store new site", function() {
			beforeEach(function() {
				id = null;
				site = null;

				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(s) {
						site = s;

						storeNewSite(site, function(i) {
							id = i;
						});
					});
				});
				
				waitsFor(function() {
					return id != null;
				}, "the ID to be set", 500);
			});

			it("should return an ID on save", function() {
				runs(function() {
					expect(id).toBe(0);
				});
			});

			it("should exist in storage", function() {
				var savedSite = null;

				runs(function() {
					getSite(id, function(s) {
						savedSite = s;
					});
				});

				waitsFor(function() {
					return savedSite != null;
				}, "the site to be gotten", 500);

				runs(function() {
					expect(savedSite).toEqual(site);
				});
			});
		});

		describe("using add sites", function() {
			var done;

			beforeEach(function() {
				done = false;

				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							done = true;
						});
					});
				});

				waitsFor(function() {
					return done;
				}, "the site to finish saving", 500);
			});

			it("should exist in storage", function() {
				var sites = null;
				
				runs(function() {
					getAllSites(function(s) {
						sites = s;
					});
				});

				waitsFor(function() {
					return sites != null;
				}, "the sites to be returned", 500);

				runs(function() {
					expect(sites.length).toBe(1);
					expect(sites[0]).toEqual({
						url: "/",
						abbreviation: "Ab",
						color: {
							red: 255,
							green: 255,
							blue: 255,
							alpha: 255
						},
						id: 0
					});
				});
			});
		});
	});

	describe("the sorted site IDs", function() {
		it("should default to a blank array", function() {
			var ids = null;

			runs(function() {
				getSortedSiteIDs(function(i) {
					ids = i;
				});
			})

			waitsFor(function() {
				return ids != null;
			}, "the sorted site IDs to be set", 500);

			runs(function() {
				expect(ids).toEqual([]);
			});
		});

		describe("when a site is added", function() {
			it("should not be empty", function() {
				var ids = null;

				runs(function() {
					createSite("/", "1", [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							getSortedSiteIDs(function(i) {
								ids = i;
							});
						});
					});
				})

				waitsFor(function() {
					return ids != null;
				}, "the sorted site IDs to be set", 500);

				runs(function() {
					expect(ids).toEqual([0]);
				});
			});
		});

		describe("when multiple sites are added", function() {
			it("should not be empty", function() {
				var ids = null;

				runs(function() {
					var sites = [];

					loop(0, 2, function(iteration, callback) {
						createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
							sites.push(site);
							callback();
						});
					}, function() {
						addSites(sites, function() {
							getSortedSiteIDs(function(i) {
								ids = i;
							});
						});
					});
				});

				waitsFor(function() {
					return ids != null;
				}, "the sorted site IDs to be set", 500);

				runs(function() {
					expect(ids).toEqual([0,1]);
				});
			});
		});

		describe("when sites are reordered", function() {
			var sites;
			var ids;

			beforeEach(function() {
				sites = [];
				ids = null;

				runs(function() {
					loop(0, 2, function(iteration, callback) {
						createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
							sites.push(site);
							callback();
						});
					}, function() {
						addSites(sites, function() {
							reorderSite(1, 0, function() {
								getSortedSiteIDs(function(i) {
									ids = i;
								});
							});
						});
					});
				});

				waitsFor(function() {
					return ids != null;
				}, "the sorted site IDs to be set", 500);
			});

			it("should not be empty", function() {
				runs(function() {
					expect(ids.length).toBe(2);
				});
			});

			it("should have the sites in the right order", function() {
				runs(function() {
					expect(ids[0]).toBe(1);
					expect(ids[1]).toBe(0);
				});
			});
		});
	});

	describe("when multiple sites are saved", function() {
		var sites;

		beforeEach(function() {
			sites = null;

			runs(function() {
				loop(0, 2, function(iteration, callback) {
					createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							callback();
						});
					});
				}, function() {
					getAllSites(function(s) {
						sites = s;
					});
				});
			});
			
			waitsFor(function() {
				return sites != null;
			}, "the sites to be saved and retrieved", 500);
		});

		it("should contain the correct number of sites", function() {
			runs(function() {
				expect(sites.length).toBe(2);
			});
		});

		it("should contain the right sites", function() {
		runs(function() {
			expect(sites[0]).toEqual({
				url: "/",
				abbreviation: "" + 0,
				color: {
					red: 255,
					green: 255,
					blue: 255,
					alpha: 255
				},
				id: 0
			});
			expect(sites[1]).toEqual({
				url: "/",
				abbreviation: "" + 1,
				color: {
					red: 255,
					green: 255,
					blue: 255,
					alpha: 255
				},
				id: 1
			});
		});
		});
	});
});

describe("Sites", function() {
	var server;

	beforeEach(function() {
		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		server.restore();
	});

	describe("should store", function() {
		var oldStorage = null;
		var oldStorageItems = null;
		var ready = false;
		var server = null;

		beforeEach(function() {
			oldStorage = storage;
			storage = TEST_STORAGE;

			server = sinon.fakeServer.create();

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

				server.restore();

				ready = true;
			});

			waitsFor(function() {
				return ready;
			}, "the storage to be ready", 500);

			ready = false;
		});

		describe("stored sites", function() {
			it("should not contain a site after it has been removed", function() {
				var sites = null;

				runs(function() {
					loop(0, 2, function(iteration, callback) {
						createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
							addSites([site], function() {
								callback();
							});
						});
					}, function() {
						removeSites([1], function() {
							getAllSites(function(s) {
								sites = s;
							});
						});
					});
				});
				
				waitsFor(function() {
					return sites != null;
				}, "the sites to be returned", 1000);

				runs(function() {
					expect(sites.length).toBe(1);
					expect(sites[0]).toEqual({
						url: "/",
						abbreviation: "" + 0,
						color: {
							red: 255,
							green: 255,
							blue: 255,
							alpha: 255
						},
						id: 0
					});
					expect(sites[1]).toBeUndefined();
				});
			});

			it("should not contain any site after all sites have been removed", function() {
				var sites = null;

				runs(function() {
					loop(0, 2, function(iteration, callback) {
						createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
							addSites([site], function() {
								callback();
							});
						});
					}, function() {
						removeSites([0,1], function() {
							getAllSites(function(s) {
								sites = s;
							});
						});
					});
				});
				
				waitsFor(function() {
					return sites != null;
				}, "the sites to be returned", 500);

				runs(function() {
					expect(sites.length).toBe(0);
					expect(sites[0]).toBeUndefined();
					expect(sites[1]).toBeUndefined();
				});
			});

			it("should update all colors", function() {
				var success = null;

				server.restore();

				runs(function() {
					loop(0, 2, function(iteration, callback) {
						createSite("http://antarcticapps.com/", "" + iteration, [255, 255, 255, 255], function(site) {
							addSites([site], function() {
								callback();
							});
						});
					}, function() {
						updateFaviconColorForAllSites(function(s) {
							success = s;
						});
					});
				});
				
				waitsFor(function() {
					return success != null;
				}, "the update operation to complete", 2000);

				runs(function() {
					expect(success).toBe(true);
				});
			});
		});

		describe("a site", function() {
			var site;

			beforeEach(function() {
				site = null;
			});

			it("should be able to change its abbreviation", function() {
				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(created) {
						addSites([created], function() {
							updateSiteAbbreviation(created.id, "Re", function() {
								getSite(created.id, function(s) {
									site = s;
								});
							});
						});
					});
				});
				
				waitsFor(function() {
					return site != null;
				}, "the site to be returned", 500);

				runs(function() {
					expect(site).toEqual({
						url: "/",
						abbreviation: "Re",
						color: {
							red: 255,
							green: 255,
							blue: 255,
							alpha: 255
						},
						id: 0
					});
				});
			});

			it("should be able to change its color", function() {
				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(created) {
						addSites([created], function() {
							updateSiteColor(created.id, [0, 0, 0], function() {
								getSite(created.id, function(s) {
									site = s;
								});
							});
						});
					});
				});
				
				waitsFor(function() {
					return site != null;
				}, "the site to be returned", 500);

				runs(function() {
					expect(site).toEqual({
						url: "/",
						abbreviation: "Ab",
						color: {
							red: 0,
							green: 0,
							blue: 0,
							alpha: 255
						},
						id: 0
					});
				});
			});

			it("should be able to change its custom color", function() {
				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(created) {
						addSites([created], function() {
							updateSiteCustomColor(created.id, [0, 0, 0], function() {
								getSite(created.id, function(s) {
									site = s;
								});
							});
						});
					});

					server.respond();
				});
				
				waitsFor(function() {
					return site != null;
				}, "the site to be returned", 500);

				runs(function() {
					expect(site).toEqual({
						url: "/",
						abbreviation: "Ab",
						color: {
							red: 255,
							green: 255,
							blue: 255,
							alpha: 255
						},
						customColor: {
							red: 0,
							green: 0,
							blue: 0,
							alpha: 255
						},
						id: 0
					});
				});
			});

			it("should be accessible by its URL", function() {
				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(created) {
						addSites([created], function() {
							getSiteForURL("/", function(s) {
								site = s;
							});
						});
					});
				});
				
				waitsFor(function() {
					return site != null;
				}, "the site to be returned", 500);

				runs(function() {
					expect(site).toEqual({
						url: "/",
						abbreviation: "Ab",
						color: {
							red: 255,
							green: 255,
							blue: 255,
							alpha: 255
						},
						id: 0
					});
				});
			});

			it("abbreviation should be accessible by its URL", function() {
				var abbreviation = null;

				runs(function() {
					createSite("/", "Te", [255, 255, 255, 255], function(created) {
						addSites([created], function() {
							getSiteAbbreviationForURL("/", function(abbrev) {
								abbreviation = abbrev;
							});
						});
					});

					server.respond();
				});
				
				waitsFor(function() {
					return abbreviation != null;
				}, "the abbreviation to be returned", 500);

				runs(function() {
					expect(abbreviation).toMatch("Te");
				});
			});
		});

		describe("stored sites count", function() {
			it("should equal 1 when a single site is added", function() {
				var sitesCount = null;

				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							getSitesCount(function(s) {
								sitesCount = s;
							});
						});
					});
				});
				
				waitsFor(function() {
					return sitesCount != null;
				}, "the sites to be returned", 500);

				runs(function() {
					expect(sitesCount).toBe(1);
				});
			});
		});
	});
});