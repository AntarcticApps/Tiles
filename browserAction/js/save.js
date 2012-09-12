
document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {
	chrome.extension.sendMessage({ message: "getUrl" }, function(response) {
		document.getElementById('abbreviation').value = makeAbbreviation(getHostname(response.url));
	});

	document.getElementById('form').onsubmit = function() {
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
