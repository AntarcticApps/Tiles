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

		$('input:checkbox.enabled').val(function(index, value) {
			fields[index].enabled = $(this).is(':checked');
		});

		console.log(fields);

		return false;
	});
});