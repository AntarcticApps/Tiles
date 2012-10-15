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
	});
});