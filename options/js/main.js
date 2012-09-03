$(document).ready(function() {
	$('#sites').submit(function() {
		var fields = [];

		$('input:text.url').val(function(index, value) {
			fields[index] = {};
			fields[index].url = value;
		});

		$('input:text.abbreviation').val(function(index, value) {
			fields[index].abbreviation = value;
		});

		console.log(fields);

		return false;
	});
});