document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {
	_gaq.push(['_trackPageview']);

	chrome.extension.sendMessage({ message: "getUrl" }, function(response) {
		document.getElementById('abbreviation').value = makeAbbreviation(getHostname(response.url));
	});

	function onAbbreviationEvent() {
		var value = document.getElementById('abbreviation').value;
		var abbreviation = makeAbbreviation(document.getElementById('abbreviation').value);
		
		if (value != abbreviation) {
			document.getElementById('abbreviation').value = abbreviation;
		}
	}

	document.getElementById('abbreviation').addEventListener("propertychange", onAbbreviationEvent);
	document.getElementById('abbreviation').addEventListener("keyup", onAbbreviationEvent);
	document.getElementById('abbreviation').addEventListener("input", onAbbreviationEvent);
	document.getElementById('abbreviation').addEventListener("paste", onAbbreviationEvent);

	var submitButton = document.getElementById('submit-btn');
	submitButton.innerHTML = chrome.i18n.getMessage('popup_add_tile');

	document.getElementById('form').onsubmit = function() {
		_gaq.push(['_trackEvent', 'Popup Add Tiles Button', 'clicked']);

		submitButton.setAttribute('class', submitButton.getAttribute('class') + ' disabled');
		submitButton.setAttribute('disabled', 'disabled');
		submitButton.innerHTML = chrome.i18n.getMessage('popup_add_tile_saving');

		var abbreviation = document.getElementById('abbreviation').value;
		chrome.extension.sendMessage({ message: "save", abbreviation: abbreviation }, function(response) {
			sendMessageToExtensionTabs("refresh");
			window.close();
		});

		return false;
	}
}