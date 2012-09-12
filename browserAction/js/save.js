
document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {
	document.getElementById('form').onsubmit = function() {
		chrome.extension.sendMessage({ message: "save" }, function(response) {
			createSite(response.url, document.getElementById('abbreviation').value, function(site) {
				saveSite(site, function() {
					chrome.extension.sendMessage({ message: "saved" }, function(response) {});
				});
			});
		});

		return false;
	}
}
