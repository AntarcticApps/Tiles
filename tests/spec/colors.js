describe("A favicon", function() {
	var server;

	beforeEach(function(done) {
		server = sinon.fakeServer.create();
		done();
	});

	afterEach(function(done) {
		server.restore();
		done();
	});

	describe("should be found in the", function() {
		var path, error;

		beforeEach(function(done) {
			path = '';
			error = false;

			done();
		});

		describe("root directory", function() {
			it("with no folders", function() {
				server.respondWith("GET", "/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

				runs(function(done) {
					faviconSearchRoot("/", function(favicon_path) {
						path = favicon_path;
						error = false;
						done();
					}, function() {
						error = true;
						done();
					});

					server.respond();
				}, 500);

				runs(function(done) {
					expect(error).toBe(false);
					expect(path).toMatch("/favicon.ico");
					done();
				});
			});

			it("with folders", function() {
				server.respondWith("GET", "/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

				runs(function(done) {
					faviconSearchRoot("/kitty/is/here", function(favicon_path) {
						path = favicon_path;
						error = false;

						done();
					}, function() {
						error = true;

						done();
					});

					server.respond();
				}, 500);

				runs(function(done) {
					expect(error).toBe(false);
					expect(path).toMatch("/favicon.ico");
					done();
				});
			});

			it("with failures", function() {
				runs(function(done) {
					faviconSearchRoot("/", function(favicon_path) {
						path = favicon_path;
						error = false;

						done();
					}, function() {
						error = true;

						done();
					});

					server.respond();
				}, 500);

				runs(function(done) {
					expect(error).toBe(true);
					expect(path).toMatch("");
					done();
				});
			});
		});

		describe("current directory", function() {
			it("as is", function() {
				server.respondWith("GET", "/kitty/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

				runs(function(done) {
					faviconSearchCurrent("/kitty", function(favicon_path) {
						path = favicon_path;
						error = false;

						done();
					}, function() {
						error = true;

						done();
					});

					server.respond();
				}, 500);

				runs(function(done) {
					expect(error).toBe(false);
					expect(path).toMatch("/kitty/favicon.ico");
					done();
				});
			});

			it("with failures", function() {
				runs(function(done) {
					faviconSearchCurrent("/kitty", function(favicon_path) {
						path = favicon_path;
						error = false;

						done();
					}, function() {
						error = true;

						done();
					});

					server.respond();
				}, 500);

				runs(function(done) {
					expect(error).toBe(true);
					expect(path).toMatch("");
					done();
				});
			});
		});

		describe("page", function() {
			describe("as a link", function() {
				it("with a relative URL locator", function() {
					server.respondWith("GET", "/index.html", [200, { "Content-Type": "text/html"},
						"<html><head><link rel=\"icon\" href=\"//www.kitty.com/meow/favicon.ico\"></head><body></body</html>"]);
					server.respondWith("GET", "http://www.kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

					runs(function(done) {
						faviconSearchForDeclared("/index.html", function(favicon_path) {
							path = favicon_path;
							error = false;

							done();
						}, function() {
							error = true;

							done();
						});

						server.respond();
					}, 500);

					runs(function(done) {
						expect(error).toBe(false);
						expect(path).toMatch("http://www.kitty.com/meow/favicon.ico");
						done();
					});
				});

				describe("with a relative path", function() {
					describe("prefixed by a '/'", function() {
						it("in a URL with a page", function() {
							server.respondWith("GET", "http://www.kitty.com/index.html", [200, { "Content-Type": "text/html"},
								"<html><head><link rel=\"icon\" href=\"/meow/favicon.ico\"></head><body></body</html>"]);
							server.respondWith("GET", "http://www.kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);
							server.respondWith("GET", "http://kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

							runs(function(done) {
								faviconSearchForDeclared("http://www.kitty.com/index.html", function(favicon_path) {
									path = favicon_path;
									error = false;

									done();
								}, function() {
									error = true;

									done();
								});

								server.respond();
							}, 500);

							runs(function(done) {
								expect(error).toBe(false);
								expect(path).toMatch("http://kitty.com/meow/favicon.ico");
								done();
							});
						});

						it("in a URL without a page", function() {
							server.respondWith("GET", "http://www.kitty.com/index", [200, { "Content-Type": "text/html"},
								"<html><head><link rel=\"icon\" href=\"/meow/favicon.ico\"></head><body></body</html>"]);
							server.respondWith("GET", "http://www.kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);
							server.respondWith("GET", "http://kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

							runs(function(done) {
								faviconSearchForDeclared("http://www.kitty.com/index", function(favicon_path) {
									path = favicon_path;
									error = false;

									done();
								}, function() {
									error = true;

									done();
								});

								server.respond();
							}, 500);

							runs(function(done) {
								expect(error).toBe(false);
								expect(path).toMatch("http://kitty.com/meow/favicon.ico");
								done();
							});
						});
					});

					describe("not prefixed by a '/'", function() {
						it("in a URL with a page", function() {
							server.respondWith("GET", "http://www.kitty.com/index.html", [200, { "Content-Type": "text/html"},
								"<html><head><link rel=\"icon\" href=\"meow/favicon.ico\"></head><body></body</html>"]);
							server.respondWith("GET", "http://www.kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);
							server.respondWith("GET", "http://kitty.com/meow/favicon.ico", [200, { "Content-Type": "image/png"}, ""]);

							runs(function(done) {
								faviconSearchForDeclared("http://www.kitty.com/index.html", function(favicon_path) {
									path = favicon_path;
									error = false;

									done();
								}, function() {
									error = true;

									done();
								});

								server.respond();
							}, 500);

							runs(function(done) {
								expect(error).toBe(false);
								expect(path).toMatch("http://www.kitty.com/meow/favicon.ico");
								done();
							});
						});
					});
				});
			});

			it("with failures", function() {
				runs(function(done) {
					faviconSearchForDeclared("/index.html", function(favicon_path) {
						path = favicon_path;
						error = false;

						done();
					}, function() {
						error = true;

						done();
					});

					server.respond();
				}, 500);

				runs(function(done) {
					expect(error).toBe(true);
					expect(path).toMatch("");
					done();
				});
			})
		});
	});
});

describe("A color", function() {
	it("should equal another identical color", function() {
		var a = colorArrayToObject([16, 16, 16, 255]);
		var b = colorArrayToObject([16, 16, 16]);

		expect(colorsAreEqual(a, b)).toBe(true);
	});

	it("should not equal a different color", function() {
		var a = colorArrayToObject([16, 16, 16, 255]);
		var b = colorArrayToObject([0, 0, 0, 255]);

		expect(colorsAreEqual(a, b)).toBe(false);
	});

	it("should not equal null", function() {
		var a = colorArrayToObject([16, 16, 16, 255]);
		var b = null;

		expect(colorsAreEqual(a, b)).toBe(false);
	});

	it("should not equal undefined", function() {
		var a = colorArrayToObject([16, 16, 16, 255]);
		var b = undefined;

		expect(colorsAreEqual(a, b)).toBe(false);
	});
});