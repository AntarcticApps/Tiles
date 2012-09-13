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

chrome.windows.onFocusChanged.addListener(function(windowID) {
	chrome.windows.get(windowID, { populate: true }, function(window) {
		var tabs = window.tabs;

		if (tabs && window.type == "normal") {
			for (var i = 0; i < tabs.length; i++) {
				if (tab.active) {
					update(tab);
					break;
				}
			}
		}
	});
});

chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({
	    "title": "Tiles Options",
	    "documentUrlPatterns": [chrome.extension.getURL("/") + "*"],
	    "contexts": ["page", "link"],
	    "onclick" : function() {
	    	goToOptionsPage(true)
	    }
	});
});

function goToOptionsPage(newTab) {
	var optionsURL = chrome.extension.getURL("options/options.html");

	if (newTab) {
		chrome.tabs.create({
			url: optionsURL
		});
	} else {
		chrome.tabs.getCurrent(function(tab) {
			chrome.tabs.update(tab.id, { url : optionsURL })
		});
	}
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('Message received: ' + request.message);

	if (request.message == "getUrl") {
		sendResponse({url: currentURL});

		console.log('Sent URL');
	} else if (request.message == "saved") {
		setPopup(false, false);
		changeIcon(true, null);

		sendResponse({message: "success"});

		console.log('Sent success');
	} else if (request.message == "delete") {
		console.log('Deleting....');

		var url;
		if (request.url == undefined)
			url = currentURL;
		else
			url = request.url;

		deleteSite(url, function() {
			setPopup(true, false);
			changeIcon(false, null);

			sendResponse({message: "deleted"});

			chrome.extension.sendMessage({message: "deleted"}, function(response) { });

			console.log('Sent deleted');
		});
	}

	chrome.windows.getAll({ populate: true }, function(windows) {
		for (var i = 0; i < windows.length; i++) {
			var window = windows[i];
			var tabs = window.tabs;

			if (tabs && window.type == "normal") {
				for (var j = 0; j < tabs.length; j++) {
					var tab = tabs[j];

					if (tab.active) {
						update(tab);
						break;
					}
				}
			}
		}
	});

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

	console.log('Popup is set to ' + details.popup);
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

	console.log('Icon is set to ' + details.path);
}