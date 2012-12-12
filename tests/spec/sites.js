const TEST_DOMAIN = chrome.extension.getURL("/tests/favicon_test/index.html");

describe("A site", function() {
	describe("object", function() {
		describe("should be created", function() {
			it("given a color", function() {
				var site = null;
				var url = "http://www.antarcticapps.com/";
				var abbreviation = "Aa";

				runs(function(done) {
					createSite(url, abbreviation, [1, 4, 9, 255], function(s) {
						site = s;
						done();
					});
				});

				runs(function(done) {
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
					done();
				});
			});

			it("with a bad URL", function() {
				var site = null;
				var url = "/";
				var abbreviation = "Aa";

				runs(function(done) {
					createSite(url, abbreviation, null, function(s) {
						site = s;
						done();
					});
				});

				runs(function(done) {
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
					done();
				});
			});

			it("with a good URL", function() {
				var site = null;
				var url = "http://www.antarcticapps.com/";
				var abbreviation = "Aa";

				runs(function(done) {
					createSite(url, abbreviation, null, function(s) {
						site = s;
						done();
					});
				});

				runs(function(done) {
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
					done();
				});
			});
		});

		describe("should be able to be assigned a color", function() {
			var site;

			beforeEach(function(done) {
				site = {};
				done();
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
		var site;

		beforeEach(function(done) {
			site = null;
			done();
		});

		describe("when removed", function() {
			var sites;
			var removedSite;

			beforeEach(function(done) {
				site = null;

				loop(0, 2, function(iteration, callback) {
					createSite(TEST_DOMAIN, "" + iteration, [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							callback();
						});
					});
				}, function() {
					removeSites([1], function() {
						getAllSites(function(s) {
							storage.get("s1", function(items) {
								removedSite = items.s1;
								done();
							});

							sites = s;
						});
					});
				});
			});

			it("should not exist in storage", function() {
				runs(function(done) {
					expect(sites.length).toBe(1);
					expect(sites[0]).toEqual({
						url: TEST_DOMAIN,
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
					expect(removedSite).toBeUndefined();
					done();
				});
			});

			it("should not be in the ids list", function() {
				var ids = null;

				runs(function(done) {
					getSortedSiteIDs(function(i) {
						ids = i;
						done();
					});
				});

				runs(function(done) {
					expect(ids).toEqual([0]);
					done();
				});
			});
		});

		it("should be able to change its abbreviation", function() {
			runs(function(done) {
				createSite(TEST_DOMAIN, "Ab", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						updateSiteAbbreviation(created.id, "Re", function() {
							getSite(created.id, function(s) {
								site = s;
								done();
							});
						});
					});
				});
			});

			runs(function(done) {
				expect(site).toEqual({
					url: TEST_DOMAIN,
					abbreviation: "Re",
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 0
				});
				done();
			});
		});

		it("should be able to change its color", function() {
			runs(function(done) {
				createSite(TEST_DOMAIN, "Ab", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						updateSiteColor(created.id, [0, 0, 0], function() {
							getSite(created.id, function(s) {
								site = s;
								done();
							});
						});
					});
				});
			});

			runs(function(done) {
				expect(site).toEqual({
					url: TEST_DOMAIN,
					abbreviation: "Ab",
					color: {
						red: 0,
						green: 0,
						blue: 0,
						alpha: 255
					},
					id: 0
				});
				done();
			});
		});

		it("should be able to change its custom color", function() {
			runs(function(done) {
				createSite(TEST_DOMAIN, "Ab", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						updateSiteCustomColor(created.id, [0, 0, 0], function() {
							getSite(created.id, function(s) {
								site = s;
								done();
							});
						});
					});
				});
			});

			runs(function(done) {
				expect(site).toEqual({
					url: TEST_DOMAIN,
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
				done();
			});
		});

		it("should be accessible by its URL", function() {
			runs(function(done) {
				createSite(TEST_DOMAIN, "Ab", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						getSiteForURL(TEST_DOMAIN, function(s) {
							site = s;
							done();
						});
					});
				});
			});

			runs(function(done) {
				expect(site).toEqual({
					url: TEST_DOMAIN,
					abbreviation: "Ab",
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 0
				});
				done();
			});
		});

		it("abbreviation should be accessible by its URL", function() {
			var abbreviation = null;

			runs(function(done) {
				createSite(TEST_DOMAIN, "Te", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						getSiteAbbreviationForURL(TEST_DOMAIN, function(abbrev) {
							abbreviation = abbrev;
							done();
						});
					});
				});
			});

			runs(function(done) {
				expect(abbreviation).toEqual("Te");
				done();
			});
		});
	});
});

describe("Site storage", function() {
	describe("when requesting a next ID", function() {
		it("should default to zero", function() {
			var id = null;

			runs(function(done) {
				getNextID(function(i) {
					id = i;
					done();
				});
			});

			runs(function(done) {
				expect(id).toBe(0);
				done();
			});
		});

		it("should increment after adding a site", function() {
			var id = null;

			runs(function(done) {
				createSite(TEST_DOMAIN, "Ab", [255, 255, 255, 255], function(site) {
					addSites([site], function() {
						getNextID(function(i) {
							id = i;
							done();
						});
					});
				});
			});

			runs(function(done) {
				expect(id).toBe(1);
				done();
			});
		});

		it("should increase by the amount of sites added", function() {
			var id = null;

			runs(function(done) {
				var sites = [];

				async_loop(0, 2, function(iteration, callback) {
					createSite(TEST_DOMAIN, "" + iteration, [255, 255, 255, 255], function(site) {
						sites.push(site);
						callback();
					});
				}, function() {
					addSites(sites, function() {
						getNextID(function(i) {
							id = i;
							done();
						});
					});
				});
			});

			runs(function(done) {
				expect(id).toBe(2);
				done();
			});
		});
	});

	describe("when storing a new site", function() {
		var id, site;

		describe("using add sites", function() {
			beforeEach(function(done) {
				createSite(TEST_DOMAIN, "Ab", [255, 255, 255, 255], function(site) {
					addSites([site], function() {
						done();
					});
				});
			});

			it("should exist in storage", function() {
				var sites = null;
				
				runs(function(done) {
					getAllSites(function(s) {
						sites = s;
						done();
					});
				});

				runs(function(done) {
					expect(sites.length).toBe(1);
					expect(sites[0]).toEqual({
						url: TEST_DOMAIN,
						abbreviation: "Ab",
						color: {
							red: 255,
							green: 255,
							blue: 255,
							alpha: 255
						},
						id: 0
					});
					done();
				});
			});

			it("should cause an update to sites count", function() {
				var sitesCount = null;

				runs(function(done) {
					getSitesCount(function(s) {
						sitesCount = s;
						done();
					});
				});

				runs(function(done) {
					expect(sitesCount).toBe(1);
					done();
				});
			});
		});
	});

	describe("the sorted site IDs", function() {
		it("should default to a blank array", function() {
			var ids = null;

			runs(function(done) {
				getSortedSiteIDs(function(i) {
					ids = i;
					done();
				});
			});

			runs(function(done) {
				expect(ids).toEqual([]);
				done();
			});
		});

		describe("when a site is added", function() {
			it("should not be empty", function() {
				var ids = null;

				runs(function(done) {
					createSite(TEST_DOMAIN, "1", [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							getSortedSiteIDs(function(i) {
								ids = i;		
								done();
							});
						});
					});
				});

				runs(function(done) {
					expect(ids).toEqual([0]);
					done();
				});
			});
		});

		describe("when multiple sites are added", function() {
			it("should not be empty", function() {
				var ids = null;

				runs(function(done) {
					var sites = [];

					loop(0, 2, function(iteration, callback) {
						createSite(TEST_DOMAIN, "" + iteration, [255, 255, 255, 255], function(site) {
							sites.push(site);
							callback();
						});
					}, function() {
						addSites(sites, function() {
							getSortedSiteIDs(function(i) {
								ids = i;
								done();
							});
						});
					});
				});

				runs(function(done) {
					expect(ids).toEqual([0,1]);
					done();
				});
			});
		});

		describe("when sites are reordered", function() {
			var sites;
			var ids;

			beforeEach(function(done) {
				sites = [];
				ids = null;

				loop(0, 2, function(iteration, callback) {
					createSite(TEST_DOMAIN, "" + iteration, [255, 255, 255, 255], function(site) {
						sites.push(site);
						callback();
					});
				}, function() {
					addSites(sites, function() {
						reorderSite(1, 0, function() {
							getSortedSiteIDs(function(i) {
								ids = i;
								done();
							});
						});
					});
				});
			});

			it("should not be empty", function() {
				runs(function(done) {
					expect(ids.length).toBe(2);
					done();
				});
			});

			it("should have the sites in the right order", function() {
				runs(function(done) {
					expect(ids[0]).toBe(1);
					expect(ids[1]).toBe(0);
					done();
				});
			});
		});
	});

	describe("when multiple sites are saved", function() {
		var sites;

		beforeEach(function(done) {
			sites = null;

			loop(0, 2, function(iteration, callback) {
				createSite(TEST_DOMAIN, "" + iteration, [255, 255, 255, 255], function(site) {
					addSites([site], function() {
						callback();
					});
				});
			}, function() {
				getAllSites(function(s) {
					sites = s;
					done();
				});
			});
		});

		it("should contain the correct number of sites", function() {
			runs(function(done) {
				expect(sites.length).toBe(2);
				done();
			});
		});

		it("should contain the right sites", function() {
			runs(function(done) {
				expect(sites[0]).toEqual({
					url: TEST_DOMAIN,
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
					url: TEST_DOMAIN,
					abbreviation: "" + 1,
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 1
				});
				done();
			});
		});
	});

	describe("when multiple sites are removed", function() {
		var sites;

		beforeEach(function(done) {
			sites = null;

			loop(0, 3, function(iteration, callback) {
				createSite(TEST_DOMAIN, "" + iteration, [255, 255, 255, 255], function(site) {
					addSites([site], function() {
						callback();
					});
				});
			}, function() {
				removeSites([0, 2], function() {
					getAllSites(function(s) {
						sites = s;
						done();
					});
				});
			});
		});

		it("should contain the correct number of sites", function() {
			runs(function(done) {
				expect(sites.length).toBe(1);
				done();
			});
		});

		it("should contain the right sites", function() {
			runs(function(done) {
				expect(sites[0]).toEqual({
					url: TEST_DOMAIN,
					abbreviation: "" + 1,
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 1
				});
				expect(sites[1]).toBeUndefined();
				expect(sites[2]).toBeUndefined();
				done();
			});
		});
	});

	describe("when updating the favicon colors", function() {
		it("should update all the sites colors", function() {
			var sites = null;

			runs(function(done) {
				createSite("http://antarcticapps.com/", "Aa", [255, 255, 255, 255], function(site) {
					addSites([site], function() {
						updateFaviconColorForAllSites(function(s) {
							done();
						});
					});
				});
			});

			runs(function(done) {
				getAllSites(function(s) {
					sites = s;
					done();
				});
			});

			runs(function(done) {
				expect(sites[0].color).toNotEqual({
					red: 255,
					green: 255,
					blue: 255,
					alpha: 255
				});
				done();
			});
		});
	});
});