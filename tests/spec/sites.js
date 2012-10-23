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
	});

	describe("in storage", function() {

	});
});

describe("Sites", function() {
	var server;

	beforeEach(function() {
		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		server.restore();

		writeUserStylesheet();
	});

	describe("should find the favicon in the", function() {
		var path, error;

		beforeEach(function() {
			path = '';
			error = false;

			done = false;
		});

		describe("root directory", function() {
			it("with no folders", function() {
				server.respondWith("GET", "/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

				runs(function() {
					faviconSearchRoot("/", function(favicon_path) {
						path = favicon_path;
						error = false;

						done = true;
					}, function() {
						error = true;

						done = true;
					});

					server.respond();
				});

				waitsFor(function() {
					return done;
				}, "the favicon path to be found", 500);

				runs(function() {
					expect(done).toBe(true);
					expect(error).toBe(false);
					expect(path).toMatch("/favicon.ico");
				});
			});

			it("with folders", function() {
				server.respondWith("GET", "/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

				runs(function() {
					faviconSearchRoot("/kitty/is/here", function(favicon_path) {
						path = favicon_path;
						error = false;

						done = true;
					}, function() {
						error = true;

						done = true;
					});

					server.respond();
				});

				waitsFor(function() {
					return done;
				}, "the favicon path to be found", 500);

				runs(function() {
					expect(done).toBe(true);
					expect(error).toBe(false);
					expect(path).toMatch("/favicon.ico");
				});
			});

			it("with failures", function() {
				runs(function() {
					faviconSearchRoot("/", function(favicon_path) {
						path = favicon_path;
						error = false;

						done = true;
					}, function() {
						error = true;

						done = true;
					});

					server.respond();
				});

				waitsFor(function() {
					return done;
				}, "the favicon path to be found", 500);

				runs(function() {
					expect(done).toBe(true);
					expect(error).toBe(true);
					expect(path).toMatch("");
				});
			});
		});

		describe("current directory", function() {
			it("as is", function() {
				server.respondWith("GET", "/kitty/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

				runs(function() {
					faviconSearchCurrent("/kitty", function(favicon_path) {
						path = favicon_path;
						error = false;

						done = true;
					}, function() {
						error = true;

						done = true;
					});

					server.respond();
				});

				waitsFor(function() {
					return done;
				}, "the favicon path to be found", 500);

				runs(function() {
					expect(done).toBe(true);
					expect(error).toBe(false);
					expect(path).toMatch("/kitty/favicon.ico");
				});
			});

			it("with failures", function() {
				runs(function() {
					faviconSearchCurrent("/kitty", function(favicon_path) {
						path = favicon_path;
						error = false;

						done = true;
					}, function() {
						error = true;

						done = true;
					});

					server.respond();
				});

				waitsFor(function() {
					return done;
				}, "the favicon path to be found", 500);

				runs(function() {
					expect(done).toBe(true);
					expect(error).toBe(true);
					expect(path).toMatch("");
				});
			});
		});

		describe("page", function() {
			describe("as a link", function() {
				it("with a relative URL locator", function() {
					server.respondWith("GET", "/index.html", [200, { "Content-Type": "text/html"},
						"<html><head><link rel=\"icon\" href=\"//www.kitty.com/meow/favicon.ico\"></head><body></body</html>"]);
					server.respondWith("GET", "http://www.kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

					runs(function() {
						faviconSearchForDeclared("/index.html", function(favicon_path) {
							path = favicon_path;
							error = false;

							done = true;
						}, function() {
							error = true;

							done = true;
						});

						server.respond();
					});

					waitsFor(function() {
						return done;
					}, "the favicon path to be found", 500);

					runs(function() {
						expect(done).toBe(true);
						expect(error).toBe(false);
						expect(path).toMatch("http://www.kitty.com/meow/favicon.ico");
					});
				});

				describe("with a relative path", function() {
					describe("prefixed by a '/'", function() {
						it("in a URL with a page", function() {
							server.respondWith("GET", "http://www.kitty.com/index.html", [200, { "Content-Type": "text/html"},
								"<html><head><link rel=\"icon\" href=\"/meow/favicon.ico\"></head><body></body</html>"]);
							server.respondWith("GET", "http://www.kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);
							server.respondWith("GET", "http://kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

							runs(function() {
								faviconSearchForDeclared("http://www.kitty.com/index.html", function(favicon_path) {
									path = favicon_path;
									error = false;

									done = true;
								}, function() {
									error = true;

									done = true;
								});

								server.respond();
							});

							waitsFor(function() {
								return done;
							}, "the favicon path to be found", 500);

							runs(function() {
								expect(done).toBe(true);
								expect(error).toBe(false);
								expect(path).toMatch("http://kitty.com/meow/favicon.ico");
							});
						});

						it("in a URL without a page", function() {
							server.respondWith("GET", "http://www.kitty.com/index", [200, { "Content-Type": "text/html"},
								"<html><head><link rel=\"icon\" href=\"/meow/favicon.ico\"></head><body></body</html>"]);
							server.respondWith("GET", "http://www.kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);
							server.respondWith("GET", "http://kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

							runs(function() {
								faviconSearchForDeclared("http://www.kitty.com/index", function(favicon_path) {
									path = favicon_path;
									error = false;

									done = true;
								}, function() {
									error = true;

									done = true;
								});

								server.respond();
							});

							waitsFor(function() {
								return done;
							}, "the favicon path to be found", 500);

							runs(function() {
								expect(done).toBe(true);
								expect(error).toBe(false);
								expect(path).toMatch("http://kitty.com/meow/favicon.ico");
							});
						});
					});

					describe("not prefixed by a '/'", function() {
						it("in a URL with a page", function() {
							server.respondWith("GET", "http://www.kitty.com/index.html", [200, { "Content-Type": "text/html"},
								"<html><head><link rel=\"icon\" href=\"meow/favicon.ico\"></head><body></body</html>"]);
							server.respondWith("GET", "http://www.kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);
							server.respondWith("GET", "http://kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

							runs(function() {
								faviconSearchForDeclared("http://www.kitty.com/index.html", function(favicon_path) {
									path = favicon_path;
									error = false;

									done = true;
								}, function() {
									error = true;

									done = true;
								});

								server.respond();
							});

							waitsFor(function() {
								return done;
							}, "the favicon path to be found", 500);

							runs(function() {
								expect(done).toBe(true);
								expect(error).toBe(false);
								expect(path).toMatch("http://www.kitty.com/meow/favicon.ico");
							});
						});
					});
				});
			});

			it("with failures", function() {
				runs(function() {
					faviconSearchForDeclared("/index.html", function(favicon_path) {
						path = favicon_path;
						error = false;

						done = true;
					}, function() {
						error = true;

						done = true;
					});

					server.respond();
				});

				waitsFor(function() {
					return done;
				}, "the favicon path to be found", 500);

				runs(function() {
					expect(done).toBe(true);
					expect(error).toBe(true);
					expect(path).toMatch("");
				});
			})
		});
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

		describe("the next ID", function() {
			it("should default to 0", function() {
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

		describe("a new site", function() {
			it("should return an ID on save", function() {
				var id = null;

				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(site) {
						storeNewSite(site, function(i) {
							id = i;
						});
					});
				});
				
				waitsFor(function() {
					return id != null;
				}, "the ID to be set", 500);

				runs(function() {
					expect(id).toBe(0);
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

			it("should change when a site is added", function() {
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

			it("should change when two sites are added", function() {
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

			it("should reorder", function() {
				var sites = [];
				var ids = null;

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

				runs(function() {
					expect(ids.length).toBe(2);
					expect(ids[0]).toBe(1);
					expect(ids[1]).toBe(0);
				});
			});
		});

		describe("stored sites", function() {
			it("should contain a site after it has been added", function() {
				var sites = null;

				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(site) {
						addSites([site], function() {
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

			it("should contain two sites after they have been added", function() {
				var sites = null;

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
				}, "the sites to be returned", 500);

				runs(function() {
					expect(sites.length).toBe(2);
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