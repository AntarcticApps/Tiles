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

var makeSitesTimeout;
const MAKE_SITES_TIMEOUT_DURATION = 500;

$(document).ready(function() {
	_gaq.push(['_trackPageview']);

	document.title = chrome.i18n.getMessage('options_title');

	chrome.storage.sync.get(null, function(items) {
		console.log(items);
	});

	var sites = [];

	sitesReload();

	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
		console.log('Message received: ' + request.message);

		if (request.message == "saved") {
			sitesReload();
		}
	});

	$("#color-regenerate-btn").on("click", function(e) {
		e.preventDefault();

		_gaq.push(['_trackEvent', 'Options Regenerate All Tile Colors', 'clicked']);

		makeSites(true);
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
							if (abbreviationField.data('oldVal') != abbreviationField.val()
								&& abbreviationField.val() != '') {
								abbreviationField.val(makeAbbreviation(abbreviationField.val()));
							
								abbreviationField.data('oldVal', abbreviationField.val());
								makeSites();
						     }

						     if (abbreviationField.val() == '') {
						     	clearTimeout(makeSitesTimeout);
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
							_gaq.push(['_trackEvent', 'Options Custom Color', 'changed']);

							newControlGroup.find('button.reset').show();
							newControlGroup.find('input[name="customColorSet"]').val("true");

							makeSites();
						});

						// color reset click event
						newControlGroup.find('button.reset').on("click", function(e) {
							e.preventDefault();

							_gaq.push(['_trackEvent', 'Options Reset Color', 'clicked']);

							$(this).hide();
							newControlGroup.find('input[name="customColorSet"]').val("false");
							newControlGroup.find('input.color').val(rgbToHex(site.color["red"], site.color["green"], site.color["blue"]));

							makeSites();
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

	function makeSites(forceColorRegeneration) {
		if (forceColorRegeneration == undefined) {
			forceColorRegeneration = false;
		}

		if (makeSitesTimeout) {
			clearTimeout(makeSitesTimeout);
		}

		makeSitesTimeout = setTimeout(function() {
			perform(forceColorRegeneration);
		}, MAKE_SITES_TIMEOUT_DURATION);

		function perform(force) {
			$("#color-regenerate-btn").attr("disabled", "disabled");

			var fields = [];
	 
			$('#sites .site-controls').each(function(index, element) {
				urlField = $(this).children('span.url').eq(0);
				abbreviationField = $(this).children('input:text.abbreviation').eq(0);
	 
				var url = urlField.html();
				var abbreviation = abbreviationField.val();
	 
				if (!url.match(/^(http|https):\/\//)) {
					url = "http://" + url;
	 
					urlField.html(url);
				}
	 
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
	   
			getSites(function(sites) {
				for (var i = 0; i < fields.length; i++) {
					fields[i].color = null;
				}

				var numberOfSitesRequiringColor = 0;
	 
			 	if (!force) {
					if (sites != null && sites.length != 0) {
						for (var i = 0; i < sites.length; i++) {
							for (var j = 0; j < fields.length; j++) {
								if (sites[i].url == fields[j].url) {
									fields[j].color = sites[i].color;
									break;
								}
							}
						}
					}
				} else {
					numberOfSitesRequiringColor = fields.length;

					console.log(Math.min(numberOfSitesRequiringColor, 0) + " sites require a color check");
				}
	  
				var siteSaved = false;

				function saveIfReady() {
					if (!siteSaved && numberOfSitesRequiringColor <= 0) {
						saveSites(fields);

						siteSaved = true;

						$("#color-regenerate-btn").removeAttr("disabled");
					}
				}
	 
				for (var i = 0; i < fields.length; i++) {
					(function() {
						var site = fields[i];

						if (!site.color) {
							setSiteColor(site, function(site, error) { 
								numberOfSitesRequiringColor--;
	 
								console.log((fields.length - numberOfSitesRequiringColor) + " / " + fields.length + " – Got color for " + site.url);
	 
								saveIfReady();
							});
						} else {
							saveIfReady();
						}
					})();
				}
			});
		}
	}
});