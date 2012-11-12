describe("Backtrack", function() {
	describe("when the version goes from old version system (x) to new version system (x.y.z)", function() {
		var changes;

		beforeEach(function() {
			changes = {
				version: {
					newValue: {
						major: 0,
						minor: 0,
						patch: 0
					},
					oldValue: 1
				}
			}
		});

		it("should detect a backtrack when the new value is an older version", function() {
			expect(didVersionBacktrack(changes)).toBe(true);
		});

		it("should not detect a backtrack when the new value is a new version", function() {
			changes.version.newValue.major = 2;

			expect(didVersionBacktrack(changes)).toBe(false);
		});

		it("should not detect a backtrack when the new value is the same version", function() {
			changes.version.newValue.major = 1;

			expect(didVersionBacktrack(changes)).toBe(false);
		});
	});

	describe("when the version changes using the new version system (x.y.z)", function() {
		var changes;

		beforeEach(function() {
			changes = {
				version: {
					newValue: {
						major: 0,
						minor: 0,
						patch: 0
					},
					oldValue: {
						major: 1,
						minor: 0,
						patch: 0
					},
				}
			}
		});

		it("should detect a backtrack when the new value is an older version", function() {
			expect(didVersionBacktrack(changes)).toBe(true);
		});

		it("should not detect a backtrack when the new value is a new version", function() {
			changes.version.newValue.major = 2;

			expect(didVersionBacktrack(changes)).toBe(false);
		});

		it("should not detect a backtrack when the new value is the same version", function() {
			changes.version.newValue.major = 1;

			expect(didVersionBacktrack(changes)).toBe(false);
		});
	});

	it("should revert changes", function() {
		var ready = false;
		var value = null;
		var changes = {
			kitty: {
				newValue: 'oscar',
				oldValue: 'garfield'
			}
		}

		runs(function() {
			storage.set({ 'kitty': 'oscar' }, function() {
				ready = true;
			});
		});

		waitsFor(function() {
			return ready;
		}, "the storage to be set up for the test", 500);

		runs(function() {
			ready = false;

			revertChanges(changes, function() {
				ready = true;
			});
		});

		waitsFor(function() {
			return ready;
		}, "the changes to be reverted", 500);

		runs(function() {
			ready = false;

			storage.get(['kitty'], function(items) {
				value = items.kitty;

				ready = true;
			});
		})

		waitsFor(function() {
			return ready;
		}, "the storage to be retrieved", 500);

		runs(function() {
			expect(value).toEqual('garfield');
		});
	});
});