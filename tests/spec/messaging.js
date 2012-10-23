describe("Messages", function() {
	it("can be sent to a single listener", function() {
		var calledBack = false;

		runs(function() {
			addMessageListener("test", function() {
				calledBack = true;
			});

			emitMessage("test");
		});

		runs(function() {
			expect(calledBack).toBe(true);
		});
	});

	it("can be sent to multiple listeners", function() {
		var calledbackCount = 0;

		runs(function() {
			var inc = function() {
				calledbackCount++;
			};

			addMessageListener("test", inc);
			addMessageListener("test", inc);
			addMessageListener("test", inc);
			
			emitMessage("test");
		});

		runs(function() {
			expect(calledbackCount).toBe(3);
		});
	});

	it("can be sent with data", function() {
		var result = "";

		runs(function() {
			var concat = function(data) {
				result += data;
			};

			addMessageListener("test", concat);
			addMessageListener("test", concat);
			addMessageListener("test", concat);
			
			emitMessage("test", "fighter");
		});

		runs(function() {
			expect(result).toMatch("fighterfighterfighter");
		});
	});

	it("can be suppressed", function() {
		var calledBack = false;

		runs(function() {
			addMessageListener("test", function() {
				calledBack = true;
			});

			suppressMessages("test");
			emitMessage("test");
		});

		runs(function() {
			expect(calledBack).toBe(false);
		});
	});

	it("can be unsuppressed", function() {
		var calledBack = false;

		runs(function() {
			addMessageListener("test", function() {
				calledBack = true;
			});

			suppressMessages("test");
			unsuppressMessages("test");
			emitMessage("test");
		});

		runs(function() {
			expect(calledBack).toBe(true);
		});
	});
});