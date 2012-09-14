const CONTROL_GROUP = '<div class="control-group"> \
	<div class="controls site-controls"> \
		<a type="button" class="btn disabled handle"><i class="icon-list"></i></a> \
		<span class="url uneditable-input"></span> \
		<input type="text" class="input-nano abbreviation" placeholder="" maxlength="2"> \
		<div class="action-buttons"> \
			<a type="button" class="btn btn-danger remove"><i class="icon-trash icon-white"></i></a> \
		</div> \
		<input type="color" class="color"> \
		<button class="btn reset">Reset Color</button> \
		<input type="hidden" name="customColorSet" value="false"> \
	</div> \
</div>';

const NO_TILES_ADDED_TEXT = "No tiles added.";

const SUBMIT_BUTTON_SAVING_TEXT = "Saving&hellip;";
const SUBMIT_BUTTON_SUBMIT_TEXT = "Save";

const FAVICON_LOAD_FAIL_TITLE = "Failed to retrieve favicon!";
const FAVICON_LOAD_FAIL_URL_REPLACE = "#{url}";
const FAVICON_LOAD_FAIL_MESSAGE = "Could not retrieve favicon for #{url}. Check the URL and ensure the site does not redirect.";

var makeSitesTimeout;
const MAKE_SITES_TIMEOUT_DURATION = 500;

$(document).ready(function() {
	chrome.storage.sync.remove("sites");

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

		makeSites(true);
	});

	function sitesReload() {	
		getSites(function (items) {
			$("#sites").html("");
			
			if (!items || items.length == 0) {
				$("#sites").prepend(NO_TILES_ADDED_TEXT);
				$("#color-regenerate-btn").attr("disabled", "disabled");
			} else {
				sites = items.reverse();

				$("#color-regenerate-btn").removeAttr("disabled");

				for (var i = 0; i < sites.length; i++) {
					(function() {
						var newControlGroup = CONTROL_GROUP;
						var site = sites[i];

						newControlGroup = $(newControlGroup);
						newControlGroup.find('span.url').html(site.url);
						newControlGroup.find('input.abbreviation').val(site.abbreviation);

						// remove button click event
						newControlGroup.find('a.remove').on('click', function(e) {
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
							newControlGroup.find('button.reset').show();
							newControlGroup.find('input[name="customColorSet"]').val("true");

							makeSites();
						});

						// color reset click event
						newControlGroup.find('button.reset').on("click", function(e) {
							e.preventDefault();
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
		chrome.extension.sendMessage({ message: "delete", url:parent.find('span.url').html() }, function(response) { });
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