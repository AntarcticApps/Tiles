chrome.extension.sendMessage({message: "save"}, function(response) {
	createSite(response.url, null, function(site) {
		saveSite(site, function() {
			document.getElementsByTagName('span')[0].innerHTML = "Site saved!";

			chrome.extension.sendMessage({message: "saved"}, function(response) {});
		});
	});
});