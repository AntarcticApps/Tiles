describe("Sites", function() {
	describe("should find the favicon in the", function() {
		var path, error, server;

		beforeEach(function() {
			path = '';
			error = false;

			done = false;

			server = sinon.fakeServer.create();
		});

		afterEach(function() {
			server.restore();
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
								expect(path).toMatch("http://kitty.com/meow/favicon.ico");
							});
						});
					});
				});
			});
		});
	});
});