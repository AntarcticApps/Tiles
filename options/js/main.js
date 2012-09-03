$(document).ready(function() {
	var upButton = '<a type="button" class="btn up"><i class="icon-arrow-up"></i></a>';
	var downButton = '<a type="button" class="btn down"><i class="icon-arrow-down"></i></a>';

	var trashButton = '<a type="button" class="btn btn-danger remove"><i class="icon-trash icon-white"></i></a>';
	var addButton = '<a type="button" class="btn btn-success add"><i class="icon-plus icon-white"></i></a>';

	var controlGroup = '<div class="control-group"> \
	<div class="controls"> \
		<input type="text" class="url" placeholder="www.google.com"> \
		<input type="text" class="input-mini abbreviation" placeholder="Gl"> \
	</div> \
</div>';

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

	updateAllButtons();

	function updateAllButtons() {
		updateControlGroupAddRemoveButtons();
		updateControlGroupSortingButtons();
	}

	function updateControlGroupAddRemoveButtons() {
		var controlsCount = $('.controls').size();

		$('.controls').each(function(index) {
			$(this).children('.btn.add').remove();
			$(this).children('.btn.remove').remove();

			if (index != controlsCount - 1 && controlsCount != 2) {
				$(this).append(trashButton);
			}

			if (index == controlsCount - 2) {
				$(this).append(addButton);
			}
		});

		$('.btn.remove').off().on('click', removeControlGroup);
		$('.btn.add').off().on('click', addControlGroup);
	}

	function removeControlGroup() {
		parent = $(this).parents('.control-group');
		parent.remove();

		updateAllButtons();
	}

	function addControlGroup() {
		parent = $(this).parents('.control-group');

		parent.after(controlGroup);

		updateAllButtons();
	}

	function updateControlGroupSortingButtons() {
		var controlsCount = $('.controls').size();

		$('.controls').each(function(index) {
			$(this).children('.btn-toolbar').remove();

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

		$('.btn.up').off().on('click', moveControlGroupUp);		
		$('.btn.down').off().on('click', moveControlGroupDown);
	}

	function moveControlGroupUp() {
		parent = $(this).parents('.control-group');

		var previous = parent.prev();

		parent.remove();
		previous.before(parent);

		updateAllButtons();
	}

	function moveControlGroupDown() {
		parent = $(this).parents('.control-group');

		var next = parent.next();

		parent.remove();
		next.after(parent);

		updateAllButtons();
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