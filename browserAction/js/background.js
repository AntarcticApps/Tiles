var currentURL = null;

chrome.tabs.onActivated.addListener(function(info) {
	chrome.tabs.get(info.tabId, function(tab) {
		update(tab.url);
	});
});

chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
	if (tab.active) {
		update(tab.url);
	}
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.message == "saved") {
		changeIcon(true, null);
	}
	
	sendResponse({url: currentURL});
});

function setPopup(save) {
	if (save) {
		chrome.browserAction.setPopup({"popup": "browserAction/save.html"});
	} else {
		chrome.browserAction.setPopup({"popup": "browserAction/delete.html"});		
	}
}

function update(url) {
	currentURL = url;

	siteExists(url, function(exists) {
		setPopup(!exists);

		changeIcon(exists, null);
	});
}

function siteExists(url, callback) {
	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		if (url.substring(url.length - 1) == '/') {
			url = url.substring(0, url.length - 1);
		}

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

	chrome.browserAction.setIcon(details, callback);
}