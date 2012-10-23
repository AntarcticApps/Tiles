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

	it("should not run when the end is less than the iteration", function() {
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

	it("should run asynchronous operations in any order", function() {
		runs(function() {
			answer = [];

			loop(0, 5, function(iteration, callback) {
				setTimeout(function() {
					answer.push(iteration);
				}, 500 - iteration * 100);

				callback();
			}, function() {
				done = true;
			});
		});

		waitsFor(function() {
			return done && answer.length == 5;
		}, "loop to finish", 5000);

		runs(function() {
			expect(answer).toEqual([4, 3, 2, 1, 0]);			
		});
	});
});

describe("An array", function() {
	it("should remove an element at an arbitrary index", function() {
		var arr = [100, 200, 300, 400];
		var removed = arr.removeAtIndex(0);
		expect(removed).toEqual(100);
		expect(arr).toEqual([200, 300, 400]);
	});

	it("should insert an element at an arbitrary index", function() {
		var arr = [100, 200, 300, 400];
		arr.insertAtIndex(0, 3);
		expect(arr).toEqual([100, 200, 300, 0, 400]);
	});

	it("should swap elements", function() {
		var arr = [100, 200, 300, 400];
		var removed = arr.removeAtIndex(-1);
		arr.insertAtIndex(removed, 2);
		expect(removed).toEqual(400);
		expect(arr).toEqual([100, 200, 400, 300]);
	});
});