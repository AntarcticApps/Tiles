chrome.extension.sendMessage({message: "delete"}, function(response) {
	document.getElementsByTagName('span')[0].innerHTML = "Deleted!";
});