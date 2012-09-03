$(document).ready(function() {
	var upButton = '<a type="button" class="btn up"><i class="icon-arrow-up"></i></a>';
	var downButton = '<a type="button" class="btn down"><i class="icon-arrow-down"></i></a>';

	function getButtons(up, down) {
		var result = '<div class="btn-toolbar"><div class="btn-group">';

		if (up) {
			result += upButton;
		}

		if (down) {
			result += downButton;
		}

		result += '</div></div>';

		return result;
	}

	var controlsCount = $('.controls').size();

	$('.controls').each(function(index) {
		if (index == controlsCount - 1) {
			return;
		}

		if (index == 0) {
			$(this).append(getButtons(false, true));
		} else if (index == controlsCount - 2) {
			$(this).append(getButtons(true, false));
		} else {
			$(this).append(getButtons(true, true));
		}
	});

	bindSortingButtons();

	function bindSortingButtons() {
		$('.btn.up').off().on('click', moveControlGroupUp);		
		$('.btn.down').off().on('click', moveControlGroupDown);
	}

	function moveControlGroupUp() {
		parent = $(this).parents('.control-group');

		var previous = parent.prev();

		parent.remove();
		previous.before(parent);

		bindSortingButtons();
	}

	function moveControlGroupDown() {
		parent = $(this).parents('.control-group');

		var next = parent.next();

		parent.remove();
		next.after(parent);

		bindSortingButtons();
	}

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