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
	it("should insert an element at an arbitrary index", function() {
		var arr = [1, 2, 3, 4];
		arr.insertAtIndex(0, 1);
		expect(arr).toEqual([1, 0, 2, 3, 4]);
	});
});