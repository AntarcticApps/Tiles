
document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {
	_gaq.push(['_trackPageview']);

	chrome.extension.sendMessage({ message: "getAbbreviation" }, function(response) {
		console.log(response);
		if (response) {
			document.getElementById('abbreviation').value = response.abbreviation;
		}
	});

	function onAbbreviationEvent() {
		var value = document.getElementById('abbreviation').value;
		var abbreviation = makeAbbreviation(document.getElementById('abbreviation').value);
		
		if (value != abbreviation) {
			document.getElementById('abbreviation').value = abbreviation;
		}

		if (abbreviation == '') {
			document.getElementById('rename-btn').setAttribute('disabled', 'disabled');
		} else {
			document.getElementById('rename-btn').removeAttribute('disabled');
		}
	}

	document.getElementById('abbreviation').addEventListener("propertychange", onAbbreviationEvent);
	document.getElementById('abbreviation').addEventListener("keyup", onAbbreviationEvent);
	document.getElementById('abbreviation').addEventListener("input", onAbbreviationEvent);
	document.getElementById('abbreviation').addEventListener("paste", onAbbreviationEvent);

	document.getElementById('form').onsubmit = function() {
		return false;
	}

	document.getElementById('rename-btn').onclick = function() {
		_gaq.push(['_trackEvent', 'Popup Rename Button', 'clicked']);

		chrome.extension.sendMessage({ message: "setAbbreviation", abbreviation: document.getElementById('abbreviation').value }, function(response) {
			sendMessageToExtensionTabs("refresh");
			window.close();
		});

		return false;
	}

	document.getElementById('remove-btn').onclick = function() {
		_gaq.push(['_trackEvent', 'Popup Delete Button', 'clicked']);

		chrome.extension.sendMessage({ message: "delete" }, function(response) {
			sendMessageToExtensionTabs("refresh");
			window.close();
		});

		return false;
	}
}
