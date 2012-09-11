chrome.extension.sendMessage({greeting: "hello"}, function(response) {
	createSite(response.url, null, function(site) {
		saveSite(site, function() {
			document.getElementsByTagName('span')[0].innerHTML = "Site saved!";
		});
	});
});