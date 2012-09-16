
document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {
	_gaq.push(['_trackPageview']);

	chrome.extension.sendMessage({ message: "getUrl" }, function(response) {
		document.getElementById('abbreviation').value = makeAbbreviation(getHostname(response.url));
	});

	function fixAbbreviationCapitalization() {
		document.getElementById('abbreviation').value = makeAbbreviation(document.getElementById('abbreviation').value);
	}

	document.getElementById('abbreviation').addEventListener("propertychange", fixAbbreviationCapitalization);
	document.getElementById('abbreviation').addEventListener("keyup", fixAbbreviationCapitalization);
	document.getElementById('abbreviation').addEventListener("input", fixAbbreviationCapitalization);
	document.getElementById('abbreviation').addEventListener("paste", fixAbbreviationCapitalization);

	var submitButton = document.getElementById('submit-btn');
	submitButton.innerHTML = chrome.i18n.getMessage('popup_add_tile');

	document.getElementById('form').onsubmit = function() {
		_gaq.push(['_trackEvent', 'Popup Add Tiles Button', 'clicked']);

		submitButton.setAttribute('class', submitButton.getAttribute('class') + ' disabled');
		submitButton.setAttribute('disabled', 'disabled');
		submitButton.innerHTML = chrome.i18n.getMessage('popup_add_tile_saving');

		chrome.extension.sendMessage({ message: "getUrl" }, function(response) {
			createSite(response.url, document.getElementById('abbreviation').value, function(site) {
				saveSite(site, function() {
					chrome.extension.sendMessage({ message: "saved" }, function(response) {
						window.close();
					});
				});
			});
		});

		return false;
	}
}
