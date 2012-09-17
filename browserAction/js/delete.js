
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

	function fixAbbreviationCapitalization() {
		document.getElementById('abbreviation').value = makeAbbreviation(document.getElementById('abbreviation').value);
	}

	document.getElementById('abbreviation').addEventListener("propertychange", fixAbbreviationCapitalization);
	document.getElementById('abbreviation').addEventListener("keyup", fixAbbreviationCapitalization);
	document.getElementById('abbreviation').addEventListener("input", fixAbbreviationCapitalization);
	document.getElementById('abbreviation').addEventListener("paste", fixAbbreviationCapitalization);

	document.getElementById('form').onsubmit = function() {
		return false;
	}

	document.getElementById('rename-btn').onclick = function() {
		_gaq.push(['_trackEvent', 'Popup Rename Button', 'clicked']);

		chrome.extension.sendMessage({ message: "setAbbreviation", abbreviation: document.getElementById('abbreviation').value }, function(response) {
			window.close();
		});

		return false;
	}

	document.getElementById('remove-btn').onclick = function() {
		_gaq.push(['_trackEvent', 'Popup Delete Button', 'clicked']);

		chrome.extension.sendMessage({ message: "delete" }, function(response) {
			window.close();
		});

		return false;
	}
}
