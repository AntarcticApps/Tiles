
const WINDOW_CLOSE_TIMEOUT = 750;

chrome.extension.sendMessage({ message: "delete" }, function(response) {
	document.getElementsByTagName('span')[0].innerHTML = "Removed";
	setTimeout(function() {
		window.close();
	}, WINDOW_CLOSE_TIMEOUT);
});
