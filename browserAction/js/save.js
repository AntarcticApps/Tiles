
const SUBMIT_BUTTON_SUBMIT_TEXT = "Add Tile";
const SUBMIT_BUTTON_SAVING_TEXT = "Saving&hellip;"

document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {
	chrome.extension.sendMessage({ message: "getUrl" }, function(response) {
		document.getElementById('abbreviation').value = makeAbbreviation(getHostname(response.url));
	});

	document.getElementById('form').onsubmit = function() {
		var submitButton = document.getElementById('submit-btn');
		submitButton.setAttribute('class', submitButton.getAttribute('class') + ' disabled');
		submitButton.setAttribute('disabled', 'disabled');
		submitButton.innerHTML = SUBMIT_BUTTON_SAVING_TEXT;

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
