const CONTROL_GROUP = '<div class="control-group"> \
	<div class="controls site-controls"> \
		<a type="button" class="btn disabled handle"><i class="icon-list"></i></a> \
		<span class="url uneditable-input input-xlarge"></span> \
		<input type="text" class="abbreviation input-nano" placeholder="" maxlength="2"> \
		<a type="button" class="btn btn-danger remove"><i class="icon-trash icon-white"></i></a> \
		<input type="color" class="color input-nano"> \
		<button class="btn reset">' + chrome.i18n.getMessage('options_reset_color') + '</button> \
		<input type="hidden" name="customColorSet" value="false"> \
	</div> \
</div>';

const DEFAULT_COLOR = "#000000";

const COLOR_TIMEOUT = 500;

var colorTimer = null;

$(document).ready(function() {
	_gaq.push(['_trackPageview']);

	document.title = chrome.i18n.getMessage('options_title');	

	var sites = [];

	sitesReload();

	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
		console.log('Message received: ' + request.message);

		if (request.message == "sitesChanged") {
			sitesReload();
		}
	});

	$("#color-regenerate-btn").on("click", function(e) {
		e.preventDefault();

		_gaq.push(['_trackEvent', 'Options Regenerate All Tile Colors', 'clicked']);

		$("#color-regenerate-btn").attr("disabled", "disabled").html("&hellip;");

		updateFaviconColorForAllSites(function() {
			$("#color-regenerate-btn").removeAttr("disabled").html("");

			chrome.extension.sendMessage({ message:"sitesChanged" }, function() {});
		});
	});

	// set background color input value to default color
	$("#background-color").val(DEFAULT_COLOR);

	// set background color input value to custom color, if exists
	getBackgroundColor(function(color) {
		if (!color) {
			return;
		}

		$("#background-color").val(rgbToHex(color["red"], color["green"], color["blue"]));
	});

	// set custom background color on click event
	$("#background-color").on("change", function() {
		var color = hexToRgb($("#background-color").parent().children('input[type=color]').val());

		if (colorTimer) {
			clearTimeout(colorTimer);
		}

		colorTimer = setTimeout(function() {
			colorTimer = null;

			setBackgroundColor(color, function() {
				chrome.extension.sendMessage({ message: "backgroundColorChanged" }, function() {});
			});
		}, COLOR_TIMEOUT);
	});

	$("#background-color").on("click", function() {
		_gaq.push(['_trackEvent', 'Options Custom Background Color Mouse Down', 'changed']);
	});

	// reset background color event
	$("#background-color-reset").on("click", function(e) {
		e.preventDefault();

		_gaq.push(['_trackEvent', 'Options Reset Background Color', 'clicked']);

		setBackgroundColor(null, function() {
			chrome.extension.sendMessage({ message: "backgroundColorChanged" }, function() {});
		});

		$("#background-color").val(DEFAULT_COLOR);
	});

	function sitesReload() {
		getSites(function (items) {
			$("#sites").html("");
			
			if (!items || items.length == 0) {
				$("#sites").prepend("<h4>" + chrome.i18n.getMessage('no_tiles_added') + "</h4><p class='message'>" + chrome.i18n.getMessage('options_no_tiles_added_help', ["<img src='../../icons/icon-bitty-gray.png'>"]) + "</p>");
				$("#color-regenerate-btn").attr("disabled", "disabled");
			} else {
				sites = items.reverse();

				$("#color-regenerate-btn").removeAttr("disabled");

				for (var i = 0; i < sites.length; i++) {
					(function() {
						var newControlGroup = CONTROL_GROUP;
						var site = sites[i];

						newControlGroup = $(newControlGroup);
						newControlGroup.find('span.url').text(site.url);
						newControlGroup.find('input.abbreviation').val(site.abbreviation);

						// remove button click event
						newControlGroup.find('a.remove').on('click', function(e) {
							_gaq.push(['_trackEvent', 'Options Delete Button', 'clicked']);

							removeControlGroup(e.target);
						});

						// abbreviation change event
						var abbreviationField = newControlGroup.find('input.abbreviation');
						abbreviationField.data('oldVal', abbreviationField.val());

						newControlGroup.find('input.abbreviation').on("propertychange keyup input paste", function() {
							var value = abbreviationField.val();

							if (abbreviationField.data('oldVal') != value && value != '') {
								value = makeAbbreviation(value);

								abbreviationField.val(value);
								abbreviationField.data('oldVal', value);

								setStoredSiteAbbreviation(site.url, value, function() {});
							}
						});

						// set up custom color, if exists
						if (site.customColor != undefined) {
							newControlGroup.find('button.reset').show();
							newControlGroup.find('input[name="customColorSet"]').val("true");
							newControlGroup.find('input.color').val(rgbToHex(site.customColor["red"], site.customColor["green"], site.customColor["blue"]));
						} else {
							newControlGroup.find('button.reset').hide();
							newControlGroup.find('input[name="customColorSet"]').val("false");
							newControlGroup.find('input.color').val(rgbToHex(site.color["red"], site.color["green"], site.color["blue"]));
						}

						// color change event
						newControlGroup.find('input.color').on("change", function() {
							newControlGroup.find('button.reset').show();
							newControlGroup.find('input[name="customColorSet"]').val("true");

							
							if (colorTimer) {
								clearTimeout(colorTimer);
							}

							var input = $(this);

							colorTimer = setTimeout(function() {
								colorTimer = null;

								setStoredSiteCustomColor(site.url, hexToRgb(input.val()), function() {});
							}, COLOR_TIMEOUT);
						});

						newControlGroup.find('input.color').on("mousedown", function() {
							_gaq.push(['_trackEvent', 'Options Custom Tile Color Mouse Down', 'changed']);
						});

						// color reset click event
						newControlGroup.find('button.reset').on("click", function(e) {
							e.preventDefault();

							_gaq.push(['_trackEvent', 'Options Reset Tile Color', 'clicked']);

							$(this).hide();
							newControlGroup.find('input[name="customColorSet"]').val("false");
							newControlGroup.find('input.color').val(rgbToHex(site.color["red"], site.color["green"], site.color["blue"]));

							setStoredSiteCustomColor(site.url, null, function() {});
						});

						$("#sites").prepend(newControlGroup);
					})();
				}
			}

			$("#sites").sortable({
				handle: '.handle',
				axis: 'y',
				update: function(e, ui) {
					makeSites();
				}
			});

			$(".container").removeClass("hidden");
		});
	}

	function removeControlGroup(element) {
		parent = $(element).parents('.control-group');
		var url = parent.find('span.url').text();

		chrome.extension.sendMessage({ message: "delete", url: url }, function(response) { });
	}

	function makeSites() {
		var fields = [];

		$('#sites .site-controls').each(function(index, element) {
			urlField = $(this).children('span.url').eq(0);
			abbreviationField = $(this).children('input:text.abbreviation').eq(0);

			var url = urlField.html();
			var abbreviation = abbreviationField.val();

			if (!abbreviation) {
				abbreviation = makeAbbreviation(getHostname(url));

				abbreviationField.val(abbreviation);
			}

			fields[index] = {};
			fields[index].url = url;
			fields[index].abbreviation = abbreviation;
			if ($(this).children('input[name="customColorSet"]').val() == "true") {
				fields[index].customColor = hexToRgb($(this).children('input[type=color]').val());
			}
		});
	}
});