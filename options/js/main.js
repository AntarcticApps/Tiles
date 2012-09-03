$(document).ready(function() {
	var upButton = '<a type="button" class="btn"><i class="icon-arrow-up"></i></a>';
	var downButton = '<a type="button" class="btn"><i class="icon-arrow-down"></i></a>';

	var buttonPair = '<div class="btn-toolbar"><div class="btn-group">' + upButton + downButton + '</div></div>';

	var controlsCount = $('.controls').size();

	$('.controls').each(function(index) {
		if (index == controlsCount - 1) {
			return;
		}

		if (index == 0) {
			$(this).append(downButton);
		} else if (index == controlsCount - 2) {
			$(this).append(upButton);
		} else {
			$(this).append(buttonPair);
		}
	});

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