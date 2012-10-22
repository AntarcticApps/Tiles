describe("Sites", function() {
	var server;

	beforeEach(function() {
		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		server.restore();
	});

	it("can be created given a color", function() {
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
		}, "The site should be created.", 500);

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
			})
		});
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
				}, "The favicon path should be found.", 500);

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
				}, "The favicon path should be found.", 500);

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
				}, "The favicon path should be found.", 500);

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
				}, "The favicon path should be found.", 500);

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
				}, "The favicon path should be found.", 500);

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
					}, "The favicon path should be found.", 500);

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
							}, "The favicon path should be found.", 500);

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
							}, "The favicon path should be found.", 500);

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
							}, "The favicon path should be found.", 500);

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
				}, "The favicon path should be found.", 500);

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
			}, "The storage should be ready.", 500);

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
			}, "The storage should be ready.", 500);

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
				}, "The ID should be set.", 500);

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
				}, "The ID should be set.", 500);

				runs(function() {
					expect(id).toBe(1);
				});
			});
		});

		describe("a new site", function() {
			it("should return an ID on save", function() {
				var id = null;

				server.respondWith("GET", "/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

				runs(function() {
					createSite("/", "Ab", function(site) {
						storeNewSite(site, function(i) {
							id = i;
						});
					});

					server.respond();
				});
				
				waitsFor(function() {
					return id != null;
				}, "The ID should be set.", 500);

				runs(function() {
					expect(id).toBe(0);
				});
			});
		});
	});
});