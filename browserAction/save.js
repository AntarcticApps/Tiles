chrome.extension.sendMessage({greeting: "hello"}, function(response) {
	document.getElementsByTagName('span')[0].innerHTML = response.url;
});