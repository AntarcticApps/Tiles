describe("A URL", function() {
	describe("with http", function() {
		it("should be able to extract the domain", function() {
			expect(getDomain('http://www.google.com')).toMatch('www.google.com');
			expect(getDomain('http://www.google.com/')).toMatch('www.google.com');
			expect(getDomain('http://www.google.com/kitty')).toMatch('www.google.com');
		});

		it("should be able to extract the hostname", function() {
			expect(getDomain('http://www.google.com')).toMatch('google.com');
			expect(getDomain('http://www.google.com/')).toMatch('google.com');
			expect(getDomain('http://www.google.com/kitty')).toMatch('google.com');
		});
	});

	describe("with https", function() {
		it("should be able to extract the domain", function() {
			expect(getDomain('https://www.google.com')).toMatch('www.google.com');
			expect(getDomain('https://www.google.com/')).toMatch('www.google.com');
			expect(getDomain('https://www.google.com/kitty')).toMatch('www.google.com');
		});
		it("should be able to extract the hostname", function() {
			expect(getDomain('https://www.google.com')).toMatch('google.com');
			expect(getDomain('https://www.google.com/')).toMatch('google.com');
			expect(getDomain('https://www.google.com/kitty')).toMatch('google.com');
		});
	});

	describe("that is a chrome URL", function() {
		it("should be detected with no subdirectories", function() {
			expect(isChromeURL("chrome://newtabpage"));
		});

		it("should be detected with subdirectories", function() {
			expect(isChromeURL("chrome://newtabpage/kitty/meow"));
			expect(isChromeURL("chrome://newtabpage/kitty/meow/"));
		});
	});

	describe("that is an extension URL", function() {
		var url = chrome.extension.getURL("/");

		it("should be detected with no subdirectories", function() {
			expect(isExtensionURL(url));
		});

		it("should be detected with subdirectories", function() {
			expect(isExtensionURL(url + "test"));
			expect(isExtensionURL(url + "test/"));
		});

		it("should be detected if it is the new tab page", function() {
			expect(isExtensionURL("chrome://newtab"));
			expect(isExtensionURL("chrome://newtab/"));
		})
	});
});

describe("A loop", function() {
	var answer, done;

	beforeEach(function() {
		answer = null;
		done = false;
	});

	it("should repeat the right number of times", function() {
		runs(function() {
			answer = 0;

			loop(0, 5, function(iteration, callback) {
				answer += iteration;

				callback();
			}, function() {
				done = true;
			});
		});

		waitsFor(function() {
			return done;
		}, "loop to finish", 500);

		runs(function() {
			expect(answer).toBe(10);			
		});
	});

	it("should not run when the end is less than the iteration", function() {
		runs(function() {
			answer = 0;

			loop(5, -1, function(iteration, callback) {
				answer += iteration;

				callback();
			}, function() {
				done = true;
			});
		});

		waitsFor(function() {
			return done;
		}, "loop to finish", 500);

		runs(function() {
			expect(answer).toBe(0);			
		});
	});
});

describe("An asynchronous loop", function() {
	var answer, done;

	beforeEach(function() {
		answer = null;
		done = false;
	});

	describe("when the end is greater than the start", function() {
		it("should repeat the right number of times", function() {
			runs(function() {
				answer = 0;

				async_loop(0, 5, function(iteration, callback) {
					answer += iteration;

					callback();
				}, function() {
					done = true;
				});
			});

			waitsFor(function() {
				return done;
			}, "loop to finish", 500);

			runs(function() {
				expect(answer).toBe(10);
			});
		});
	});

	describe("when the end is one more than the start", function() {
		it("should repeat the right number of times", function() {
			runs(function() {
				answer = 1;

				async_loop(0, 1, function(iteration, callback) {
					answer += iteration;

					callback();
				}, function() {
					done = true;
				});
			});

			waitsFor(function() {
				return done;
			}, "loop to finish", 500);

			runs(function() {
				expect(answer).toBe(1);
			});
		});
	});

	describe("when the end is less than the start", function() {
		it("should not run", function() {
			runs(function() {
				answer = 0;

				async_loop(5, -1, function(iteration, callback) {
					answer += iteration;

					callback();
				}, function() {
					done = true;
				});
			});

			waitsFor(function() {
				return done;
			}, "loop to finish", 500);

			runs(function() {
				expect(answer).toBe(0);			
			});
		});
	});

	describe("when running asynchronous operations", function() {
		it("should run them in any order", function() {
			runs(function() {
				answer = [];

				async_loop(0, 5, function(iteration, callback) {
					setTimeout(function() {
						answer.push(iteration);

						callback();
					}, 500 - iteration * 100);
				}, function() {
					done = true;
				});
			});

			waitsFor(function() {
				return done;
			}, "loop to finish", 5000);

			runs(function() {
				expect(answer).toEqual([4, 3, 2, 1, 0]);			
			});
		});

		it("should wait for the asynchronous operations to finish", function() {
			runs(function() {
				answer = [];

				async_loop(0, 5, function(iteration, callback) {
					setTimeout(function() {
						answer.push(iteration);

						callback();
					}, 1000);
				}, function() {
					done = true;
				});
			});

			waitsFor(function() {
				return done;
			}, "loop to finish", 5000);

			runs(function() {
				expect(answer).toEqual([0, 1, 2, 3, 4]);			
			});
		});
	});
});

describe("An HTTP request", function() {
	var server = null;
	var success, error, response;

	beforeEach(function() {
		server = sinon.fakeServer.create();

		success = false;
		error = false;
		response = null;
	});

	afterEach(function() {
		server.restore();
	});

	describe("making a request that will respond 200", function() {
		beforeEach(function() {
			server.respondWith("GET", "/", [200, { "Content-Type": "text/html"}, "yay"]);

			runs(function() {
				makeHTTPRequest('/', function(res, headers) {
					response = res;

					success = true;
				}, function(status) {
					error = true;
				});

				server.respond();
			});

			waitsFor(function() {
				return success || error;
			}, "the HTTP request to finish", 500);
		});

		it("should be successful", function() {
			expect(success).toBe(true);
			expect(error).toBe(false);
		});

		it("should have the correct response", function() {
			expect(response).toEqual("yay");
		});
	});

	describe("making a request that will respond 404", function() {
		beforeEach(function() {
			server.respondWith("GET", "/", [404, { "Content-Type": "text/html"}, "yay"]);

			runs(function() {
				makeHTTPRequest('/', function(res, headers) {
					response = res;

					success = true;
				}, function(status) {
					error = true;
				});

				server.respond();
			});

			waitsFor(function() {
				return success || error;
			}, "the HTTP request to finish", 500);
		});

		it("should not be successful", function() {
			expect(success).toBe(false);
			expect(error).toBe(true);
		});

		it("should have no response", function() {
			expect(response).toBeNull();
		});
	});

	describe("making a request that will respond 301", function() {
		beforeEach(function() {
			server.respondWith("GET", "/", [301, { "Content-Type": "text/html"}, "yay"]);

			runs(function() {
				makeHTTPRequest('/', function(res, headers) {
					response = res;

					success = true;
				}, function(status) {
					error = true;
				});

				server.respond();
			});

			waitsFor(function() {
				return success || error;
			}, "the HTTP request to finish", 500);
		});

		it("should not be successful", function() {
			expect(success).toBe(false);
			expect(error).toBe(true);
		});

		it("should have no response", function() {
			expect(response).toBeNull();
		});
	});
});

describe("An array", function() {
	var arr = [];

	beforeEach(function() {
		arr = [100, 200, 300, 400];
	});

	describe("should remove", function() {
		it("an element in the array", function() {
			var removed = arr.removeElementEqualTo(300);

			expect(removed).toEqual(300);
			expect(arr).toEqual([100, 200, 400]);
		});

		it("an element not in the array", function() {
			var removed = arr.removeElementEqualTo(800);

			expect(removed).toEqual(null);
			expect(arr).toEqual([100, 200, 300, 400]);
		});
	});

	describe("should remove the element at the index", function() {
		it("in the array", function() {
			var removed = arr.removeAtIndex(0);

			expect(removed).toEqual(100);
			expect(arr).toEqual([200, 300, 400]);
		});

		it("outside of the array (pos)", function() {
			var removed = arr.removeAtIndex(800);

			expect(removed).toEqual(null);
			expect(arr).toEqual([100, 200, 300, 400]);
		});
	});

	it("should insert an element at an arbitrary index", function() {
		arr.insertAtIndex(0, 3);

		expect(arr).toEqual([100, 200, 300, 0, 400]);
	});

	it("should swap elements", function() {
		var removed = arr.removeAtIndex(-1);
		arr.insertAtIndex(removed, 2);

		expect(removed).toEqual(400);
		expect(arr).toEqual([100, 200, 400, 300]);
	});
});