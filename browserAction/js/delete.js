
document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {
	_gaq.push(['_trackPageview']);

	document.getElementById('form').onsubmit = function() {
		_gaq.push(['_trackEvent', 'Popup Delete Button', 'clicked']);

		chrome.extension.sendMessage({ message: "delete" }, function(response) {
			window.close();
		});

		return false;
	}
}
