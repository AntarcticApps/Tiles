$(document).ready(function() {
	var upButton = '<a type="button" class="btn up"><i class="icon-arrow-up"></i></a>';
	var downButton = '<a type="button" class="btn down"><i class="icon-arrow-down"></i></a>';

	var trashButton = '<a type="button" class="btn btn-danger remove"><i class="icon-trash icon-white"></i></a>';
	var addButton = '<a type="button" class="btn btn-success add"><i class="icon-plus icon-white"></i></a>';

	var controlGroup = '<div class="control-group"> \
	<div class="controls site-controls"> \
		<input type="text" class="url" placeholder="www.google.com"> \
		<input type="text" class="input-mini abbreviation" placeholder="Gl" maxlength="2"> \
	</div> \
</div>';

	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		if (sites == undefined || sites == null) {
			$("#sites").prepend(controlGroup);
		} else {
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
		var siteControlsCount = $('.site-controls').size();

		$('.site-controls').each(function(index) {
			$(this).children('.btn.add').remove();
			$(this).children('.btn.remove').remove();

			if (index != siteControlsCount && siteControlsCount != 1) {
				$(this).append(trashButton);
			}

			if (index == siteControlsCount - 1) {
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
		var siteControlsCount = $('.site-controls').size();

		$('.site-controls').each(function(index) {
			$(this).children('.btn-toolbar').remove();

			if (index == 0) {
				$(this).append(getButtons(false, true));
			} else if (index == siteControlsCount - 1) {
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

	function isWhite(color) {
		const TOLERANCE = 20;

		return 255 - color[0] <= TOLERANCE
			&& 255 - color[1] <= TOLERANCE
			&& 255 - color[2] <= TOLERANCE;
	}

	function getFaviconColor(url, callback) {
		var image = new Image();
		image.onload = function() {
			console.log(image.width, image.height);
			var context = $("canvas")[0].getContext('2d');
			context.clearRect(0, 0, $("canvas")[0].width, $("canvas")[0].height);
			context.drawImage(image, 0, 0);

			var average = [0, 0, 0, 0];
			var opaquePixels = 0;

			var majorityCandidate = null;
			var retainCount = 1;

			const TOLERANCE = 20;

			for (var x = 0; x < image.width; x++) {
				for (var y = 0; y < image.height; y++) {
					data = context.getImageData(x, y, 1, 1).data;

					if (majorityCandidate == null
						&& data[3] == 255
						&& !isWhite(data)) {
						majorityCandidate = data;
					}

					if (majorityCandidate) {
						if (Math.abs(data[0] - majorityCandidate[0]) <= TOLERANCE
							&& Math.abs(data[1] - majorityCandidate[1]) <= TOLERANCE
							&& Math.abs(data[2] - majorityCandidate[2]) <= TOLERANCE
							&& !isWhite(data)
							&& data[3] == 255) {
							retainCount++;

							// for (var i = 0; i < data.length; i++) {
							// 	majorityCandidate[i] = (majorityCandidate[i] + data[i]) / 2;
							// }
						} else if (data[3] == 255
							&& !isWhite(data)) {
							retainCount--;
						}

						if (retainCount == 0) {
							majorityCandidate = data;
						}
					}

					// if (data[3] == 255) {
					// 	for (var i = 0; i < data.length; i++) {
					// 		average[i] += data[i];
					// 	}

					// 	opaquePixels++;
					// }
				}
			}

			// for (var i = 0; i < average.length; i++) {
			// 	average[i] /= opaquePixels;

			// 	if (i != average.length - 1) {
			// 		average[i] = Math.round(average[i]);
			// 	} else {
			// 		average[i] /= 255;
			// 	}
			// }

			callback(majorityCandidate);
		}
		image.src = url + '/favicon.ico';
		console.log(image.src);
		// image.src = 'http://www.google.com/s2/favicons?domain=' + url;
	}

	$('#sites').submit(function(event) {
		event.preventDefault();
		event.stopPropagation();

		var fields = [];

		$('input:text.url').each(function(index, element) {
			var siteControlsCount = $('.site-controls').size();
			var value = $(this).val();

			if (!value || value.length == 0) {
				if (siteControlsCount > 1) {
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

		for (var i = 0; i < fields.length; i++) {
			(function() {
				var url = fields[i].url;
				$.get(url, function(response) {
					var title = (/<title>(.*?)<\/title>/m).exec(response);
					if (title) {
						console.log(url, title);
					}
				});
			})();
		}

		$('input:text.abbreviation').each(function(index, element) {
			var value = $(this).val();

			fields[index].abbreviation = value;
		});

		var sitesWithColors = 0;

		for (var i = 0; i < fields.length; i++) {
			(function() {
				var site = fields[i];

				getFaviconColor(site.url, function(color) {
					console.log(site, color);

					site.color = {
						'red': color[0],
						'green': color[1],
						'blue': color[2],
						'alpha': color[3]
					};

					sitesWithColors++;

					if (sitesWithColors == fields.length) {
						chrome.storage.sync.set({"sites": fields}, function() {
							$("#success").addClass("show");

							window.setTimeout(function() {
								$("#success").removeClass("show");
							}, 2000);
						});
					}
				});
			})();
		}

		return false;
	});
});