
document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );



function init() {
	document.getElementById('form').onsubmit = function() {
		chrome.extension.sendMessage({ message: "delete" }, function(response) {
			window.close();
		});

		return false;
	}
}
