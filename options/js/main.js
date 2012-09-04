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

	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		if (sites.length == 0) {
			$("#sites").prepend(controlGroup);
		}

		sites = sites.reverse();

		for (var i = 0; i < sites.length; i++) {
			var newControlGroup = controlGroup;
			var site = sites[i];

			newControlGroup = $(newControlGroup);
			newControlGroup.find('input.url').val(site.url);
			newControlGroup.find('input.abbreviation').val(site.abbreviation);

			$("#sites").prepend(newControlGroup);
		}

		updateAllButtons();

		$(".container").removeClass("hidden");
	});

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

			if (index == controlsCount - 1 || controlsCount == 2) {
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

	function getFaviconColor(url) {
		var image = new Image();
		image.onload = function() {
			var context = $("canvas")[0].getContext('2d');
			context.drawImage(image, 0, 0);

			console.log(image.src);

			var average = [0, 0, 0, 0];

			for (var x = 0; x < image.width; x++) {
				for (var y = 0; y < image.height; y++) {
					data = context.getImageData(x, y, 1, 1).data;

					for (var i = 0; i < data.length; i++) {
						average[i] += data[i];
					}
				}
			}

			for (var i = 0; i < average.length; i++) {
				average[i] /= image.width * image.height;
				average[i] /= 255;
			}

			console.log(average);
		}
		image.src = url + '/favicon.ico';
		// image.src = 'http://www.google.com/s2/favicons?domain=' + url;

		return 0;
	}

	$('#sites').submit(function(event) {
		event.preventDefault();
		event.stopPropagation();

		var fields = [];

		$('input:text.url').each(function(index, element) {
			var controlsCount = $('.controls').size();
			var value = $(this).val();

			if (!value || value.length == 0) {
				if (controlsCount > 2) {
					$(this).parents('.control-group').remove();

					updateAllButtons();
					return;
				}
			}
		});

		$('input:text.url').each(function(index, element) {
			var value = $(this).val();

			if (!value.match(/^(http|https):\/\//)) {
				value = "http://" + value;
				$(this).val(value);
			}

			fields[index] = {};
			fields[index].url = value;
		});

		$('input:text.abbreviation').each(function(index, element) {
			var value = $(this).val();

			fields[index].abbreviation = value;
		});

		for (var i = 0; i < fields.length; i++) {
			var site = fields[i];

			console.log(getFaviconColor(site.url));
		}

		chrome.storage.sync.set({"sites": fields}, function() {
			$("#success").addClass("show");

			window.setTimeout(function() {
				$("#success").removeClass("show");
			}, 2000);
		});

		return false;
	});
});