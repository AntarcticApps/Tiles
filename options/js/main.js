const CONTROL_GROUP = '<div class="control-group"> \
	<div class="controls site-controls"> \
		<a type="button" class="btn disabled handle"><i class="icon-list"></i></a> \
		<input type="text" class="url" placeholder="www.google.com"> \
		<input type="text" class="input-nano abbreviation" placeholder="Gl" maxlength="2"> \
		<div class="action-buttons"> \
			<a type="button" class="btn btn-danger remove"><i class="icon-trash icon-white"></i></a> \
			<a type="button" class="btn btn-success add"><i class="icon-plus icon-white"></i></a> \
		</div> \
	</div> \
</div>';

const SUBMIT_BUTTON_SAVING_TEXT = "Saving...";
const SUBMIT_BUTTON_SUBMIT_TEXT = "Save";

const FAVICON_LOAD_FAIL_TITLE = "Failed to retrieve favicon!";
const FAVICON_LOAD_FAIL_URL_REPLACE = "#{url}";
const FAVICON_LOAD_FAIL_MESSAGE = "Could not retrieve favicon for #{url}. Check the URL and ensure the site does not redirect.";

$(document).ready(function() {
	var sites = [];

	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		if (sites == undefined || sites == null) {
			$("#sites").prepend(CONTROL_GROUP);
		} else {
			if (sites.length == 0) {
				$("#sites").prepend(CONTROL_GROUP);
			}

			sites = sites.reverse();

			for (var i = 0; i < sites.length; i++) {
				var newControlGroup = CONTROL_GROUP;
				var site = sites[i];

				newControlGroup = $(newControlGroup);
				newControlGroup.find('input.url').val(site.url);
				newControlGroup.find('input.abbreviation').val(site.abbreviation);

				$("#sites").prepend(newControlGroup);
			}
		}

		updateButtons();
		$("#sites").sortable({
			handle: '.handle',
			axis: 'y',
			update: function(event, ui) {
				updateButtons();
			}
		});

		$("button.close").on('click', function() {
			$(".alert-error").addClass("hidden").find("span").empty();
		});

		$(".container").removeClass("hidden");
	});

	updateButtons();

	function updateButtons() {
		var siteControlsCount = $('.site-controls').size();

		if (siteControlsCount == 1) {
			$('.site-controls').find('.btn.remove').addClass("hidden");
		} else {
			$('.site-controls').find('.btn.remove').removeClass("hidden");
		}

		$('.btn.remove').off().on('click', removeControlGroup);
		$('.btn.add').off().on('click', addControlGroup);
	}

	function removeControlGroup() {
		parent = $(this).parents('.control-group');
		parent.remove();

		updateButtons();
	}

	function addControlGroup() {
		parent = $(this).parents('.control-group');

		parent.after(CONTROL_GROUP);

		updateButtons();
	}

	function saveSites(sites) {
		console.log("Saving all sites");

		console.log(sites);

		chrome.storage.sync.remove("sites");

		chrome.storage.sync.set({"sites": sites}, function() {
			$("button.submit").removeClass("disabled").html(SUBMIT_BUTTON_SUBMIT_TEXT);
		});
	}

	$('form').submit(function(event) {
		event.preventDefault();
		event.stopPropagation();

		var fields = [];

		$(".alert-error").addClass("hidden");

		$("button.submit").addClass("disabled").html(SUBMIT_BUTTON_SAVING_TEXT);

		$('input:text.url').each(function(index, element) {
			var siteControlsCount = $('.site-controls').size();
			var value = $(this).val();

			if (!value || value.length == 0) {
				if (siteControlsCount > 1) {
					$(this).parents('.control-group').remove();

					updateButtons();
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
			}

			$(this).val(fields[index].abbreviation);
		});

		var numberOfSitesRequiringColor = fields.length;

		chrome.storage.sync.get('sites', function(items) {
			sites = items['sites'];

			for (var i = 0; i < fields.length; i++) {
				fields[i].color = null;
			}

			if (sites != null && sites.length != 0) {
				for (var i = 0; i < sites.length; i++) {
					for (var j = 0; j < fields.length; j++) {
						if (sites[i].url == fields[j].url) {
							if (siteNeedsColorUpdate(sites[i])) {
								fields[i].color = null;
							} else {
								fields[j].color = sites[i].color;
								fields[i].lastUpdated = sites[i].lastUpdated;

								numberOfSitesRequiringColor--;
							}
						}
					}
				}
			}

			console.log(numberOfSitesRequiringColor + " sites require a color check");

			var siteSaved = false;

			for (var i = 0; i < fields.length; i++) {
				(function() {
					var site = fields[i];

					if (site.color != null) {
						if (!siteSaved && numberOfSitesRequiringColor <= 0) {
							saveSites(fields);

							siteSaved = true;
						}
					} else {
						setSiteColor(site, function(site, error) {
							if (error) {
								$(".alert-error").removeClass("hidden");
								$(".alert-error").children("span").html(FAVICON_LOAD_FAIL_MESSAGE.replace(FAVICON_LOAD_FAIL_URL_REPLACE, url));
								$(".alert-error").children("h4").html(FAVICON_LOAD_FAIL_TITLE);
							}

							numberOfSitesRequiringColor--;

							console.log((fields.length - numberOfSitesRequiringColor) + " / " + fields.length + " – Got color for " + site.url);

							if (!siteSaved && numberOfSitesRequiringColor <= 0) {
								saveSites(fields);

								siteSaved = true;
							}
						});
					}
				})();
			}
		});

		return false;
	});
});