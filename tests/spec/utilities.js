describe("Utilities", function() {
	it("should get the domain", function() {
		expect(getDomain('http://www.google.com')).toMatch('www.google.com');
		expect(getDomain('http://www.google.com/')).toMatch('www.google.com');
		expect(getDomain('http://www.google.com/kitty')).toMatch('www.google.com');

		expect(getDomain('https://www.google.com')).toMatch('www.google.com');
		expect(getDomain('https://www.google.com/')).toMatch('www.google.com');
		expect(getDomain('https://www.google.com/kitty')).toMatch('www.google.com');
	});

	it("should get the hostname", function() {
		expect(getDomain('http://www.google.com')).toMatch('google.com');
		expect(getDomain('http://www.google.com/')).toMatch('google.com');
		expect(getDomain('http://www.google.com/kitty')).toMatch('google.com');

		expect(getDomain('https://www.google.com')).toMatch('google.com');
		expect(getDomain('https://www.google.com/')).toMatch('google.com');
		expect(getDomain('https://www.google.com/kitty')).toMatch('google.com');
	});
});

describe("An array", function() {
	it("should remove an element at an arbitrary index", function() {
		var arr = [100, 200, 300, 400];
		var removed = arr.remove(0);
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
		var removed = arr.remove(-1);
		arr.insertAtIndex(removed, 2);
		expect(removed).toEqual(400);
		expect(arr).toEqual([100, 200, 400, 300]);
	});
});