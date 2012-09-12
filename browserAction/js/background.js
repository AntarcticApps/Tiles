var currentURL = null;
var currentTabID = null;

chrome.tabs.onActivated.addListener(function(info) {
	chrome.tabs.get(info.tabId, function(tab) {
		update(tab);
	});
});

chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
	if (tab.active) {
		update(tab);
	}
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.message == "getUrl") {
		sendResponse({url: currentURL});
	} else if (request.message == "saved") {
		changeIcon(true, null);

		sendResponse({message: "success"});
	} else if (request.message == "delete") {
		deleteSite(currentURL, function() {
			changeIcon(false, null);

			sendResponse({message: "deleted"});
		});
	}

	return true;
});

function setPopup(save, error) {
	var details = {};

	if (error) {
		details.popup = 'browserAction/error.html';
	} else {
		if (save) {
			details.popup = 'browserAction/save.html';
		} else {
			details.popup = 'browserAction/delete.html';
		}
	}

	details.tabId = currentTabID;

	chrome.browserAction.setPopup(details);
}

function update(tab) {
	currentTabID = tab.id;
	currentURL = tab.url;

	if (isChromeURL(currentURL)) {
		setPopup(false, true);
	} else {
		siteExists(tab.url, function(exists) {
			setPopup(!exists, false);

			changeIcon(exists, null);
		});
	}
}

function isChromeURL(url) {
	return url.substring(0, 6) == 'chrome';
}

function siteExists(url, callback) {
	getSites(function(sites) {
		if (sites) {
			for (var i = 0; i < sites.length; i++) {
				if (sites[i].url == url) {
					return callback(true);
				}
			}
		}

		return callback(false);
	});
}

function changeIcon(colors, callback) {
	var details = {};

	if (colors) {
		details.path = '../icons/icon-bitty.png';
	} else {
		details.path = '../icons/icon-bitty-gray.png';
	}

	details.tabId = currentTabID;

	chrome.browserAction.setIcon(details, callback);
}