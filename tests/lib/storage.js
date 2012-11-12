var ready;

beforeEach(function() {
	ready = false;
	storage = TEST_STORAGE;

	storage.clear(function() {
		ready = true;
	});

	waitsFor(function() {
		return ready;
	}, "the storage to be set up for testing", 500);
});

afterEach(function() {
	storage = DEFAULT_STORAGE;
});