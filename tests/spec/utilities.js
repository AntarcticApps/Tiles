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