var sites;

$(document).ready(function() {
	var upButton = '<a type="button" class="btn up"><i class="icon-arrow-up"></i></a>';
	var downButton = '<a type="button" class="btn down"><i class="icon-arrow-down"></i></a>';

	var trashButton = '<a type="button" class="btn btn-danger remove"><i class="icon-trash icon-white"></i></a>';
	var addButton = '<a type="button" class="btn btn-success add"><i class="icon-plus icon-white"></i></a>';

	var controlGroup = '<div class="control-group"> \
	<div class="controls site-controls"> \
		<input type="text" class="url" placeholder="www.google.com"> \
		<input type="text" class="input-nano abbreviation" placeholder="Gl" maxlength="2"> \
	</div> \
</div>';

	var submitButtonSavingText = "Saving...";
	var submitButtonSubmitText = "Save";

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
		$("#sites").sortable();

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

	$('form').submit(function(event) {
		event.preventDefault();
		event.stopPropagation();

		var fields = [];

		$("button.submit").addClass("disabled").html(submitButtonSavingText);

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

		$('input:text.abbreviation').each(function(index, element) {
			var value = $(this).val();

			if (value) {
				fields[index].abbreviation = makeAbbreviation(value);
			} else {
				var abbreviation = makeAbbreviation(getHostname(fields[index].url));

				fields[index].abbreviation = abbreviation;
				$(this).val(abbreviation);
			}
		});

		var sitesWithColors = 0;

		for (var i = 0; i < fields.length; i++) {
			(function() {
				var site = fields[i];

				getFaviconColor(site.url, function(color) {
					console.log((sitesWithColors + 1) + " / " + fields.length + " – Got color for " + site.url);

					site.color = {
						'red': color[0],
						'green': color[1],
						'blue': color[2],
						'alpha': color[3]
					};

					sitesWithColors++;

					if (sitesWithColors == fields.length) {
						chrome.storage.sync.set({"sites": fields}, function() {
							$("button.submit").removeClass("disabled").html(submitButtonSubmitText);
						});
					}
				});
			})();
		}

		return false;
	});
});

function makeAbbreviation(string) {
	return string.substring(0, 1).toUpperCase() + string.substring(1, 2).toLowerCase();
}

function isWhiteOrTransparent(color) {
	const TOLERANCE = 20;

	if (color[3] != 255)
		return true;

	return 255 - color[0] <= TOLERANCE
		&& 255 - color[1] <= TOLERANCE
		&& 255 - color[2] <= TOLERANCE;
}

function getFaviconColor(url, callback) {
	var image = new Image();

	image.onload = function() {
		var context = $("canvas")[0].getContext('2d');
		context.clearRect(0, 0, $("canvas")[0].width, $("canvas")[0].height);
		context.drawImage(image, 0, 0);

		var majorityCandidate = null;
		var retainCount = 1;

		const TOLERANCE = 10;

		var imageData = context.getImageData(0, 0, image.width, image.height);

		for (var i = 0; i < imageData.data.length; i += 4) {
			var pixel = [imageData.data[i],
			imageData.data[i + 1],
			imageData.data[i + 2],
			imageData.data[i + 3]];

			if (majorityCandidate == null && !isWhiteOrTransparent(pixel)) {
				majorityCandidate = pixel;
			}

			if (majorityCandidate) {
				if (pixelsAreSimilar(majorityCandidate, pixel) && !isWhiteOrTransparent(pixel)) {
					retainCount++;

					majorityCandidate = averagePixels(majorityCandidate, pixel, retainCount);
				} else if (!isWhiteOrTransparent(pixel)) {
					retainCount--;
				}

				if (retainCount == 0) {
					majorityCandidate = pixel;

					retainCount = 1;
				}
			}
		}

		callback(majorityCandidate);
	}

	var failColor = [0, 0, 0, 0];

	$.get(url).success(function(data) {
		// Search for Apple touch icon
		var regex = /<link rel="apple-touch-icon" href="([\S]+)" ?\/?>/gim;
		var results = regex.exec(data);

		if (results != null) {
			var iconPath = results[1];

			if (iconPath.substring(0, 4) == "http") {
				image.src = iconPath;
			} else if (iconPath.substring(0, 2) == "//") {
				image.src = "http:" + iconPath;
			} else {
				image.src = getDomain(url) + iconPath;
			}

			return;
		}

		// Search for any icon
		var regex = /<link rel="[\S ]*icon" href="([\S]+)" ?\/?>/gim;
		var results = regex.exec(data);
		
		if (results != null) {
			var iconPath = results[1];

			if (iconPath.substring(0, 4) == "http") {
				image.src = iconPath;
			} else if (iconPath.substring(0, 2) == "//") {
				image.src = "http:" + iconPath;
			} else {
				image.src = getDomain(url) + iconPath;
			}

			return;
		}

		$.get(url + '/favicon.ico').success(function() {
			// Search the existing directory
			image.src = url + '/favicon.ico';
		}).error(function() {
			// Search for the favicon in the root of the site.
			var domain = getDomain(url);

			$.get(domain + '/favicon.ico').success(function() {
				image.src = domain + '/favicon.ico';
			}).error(function() {
				console.error("Could not find any icons for url – " + url);
				callback(failColor);
			})
		});
	}).error(function() {
		console.error("Could not load url – " + url);
		callback(failColor);
	});
}

function pixelsAreSimilar(a, b) {
	const TOLERANCE = 0.001;

	var aHSL = rgbToHsl(a[0], a[1], a[2]);
	var bHSL = rgbToHsl(b[0], b[1], b[2]);

	return Math.abs(aHSL[0] - bHSL[0]) <= TOLERANCE;
}

/**
 * Source: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
	r /= 255, g /= 255, b /= 255;

	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max == min){
	    h = s = 0; // achromatic
	} else {
	    var d = max - min;
	    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	    
	    switch(max) {
	        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	        case g: h = (b - r) / d + 2; break;
	        case b: h = (r - g) / d + 4; break;
	    }
	   
	    h /= 6;
	}

	return [h, s, l];
}

function averagePixels(a, b, ratio) {
	var weight;
	ratio++;
	if (ratio <= 0) {
		return null;
	} else {
		weight = 1 - (1 / ratio);
	}

	var avg = [];
	for (var i = 0; i < a.length; i++) {
		avg[i] = Math.round( (weight * a[i]) + ((1 - weight) * b[i]) );
	}

	return avg;
}