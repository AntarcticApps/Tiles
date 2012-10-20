var lastFocusedWindowID = 1;

function init() {
	console.log("Tiles background page started");

	chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT, { populate: true }, function(window) {
		if (window.type == 'normal') {
			lastFocusedWindowID = chrome.windows.WINDOW_ID_CURRENT;
		}

		updateWindow(window);
	});

	getBackgroundColor(function(color) {
		if (!color) {
			getFileSystem(function(fs) {
				writeToFile(fs, "user.css", "body { background: rgb(0, 0, 0); }");
			});
		} else {
			getFileSystem(function(fs) {
				writeToFile(fs, "user.css", "body { background: rgb(" + color['red'] + ", " + color['green'] + ", " + color['blue'] + "); }");
			});
		}
	});
}

chrome.tabs.onActivated.addListener(function(info) {
	chrome.tabs.get(info.tabId, function(tab) {
		updateTab(tab);
	});
});

chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
	if (tab.active) {
		updateTab(tab);
	}
});

chrome.windows.onFocusChanged.addListener(function(windowID) {
	if (windowID == -1) {
		return;
	}

	chrome.windows.get(windowID, { populate: true }, function(window) {
		if (window.type == 'normal') {
			lastFocusedWindowID = windowID;
		}

		updateWindow(window);
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
		getFocusedTab(function(tab) {
			if (tab) {
				sendResponse({ url: tab.url });

				console.log('Sent URL - ' + tab.url);
			}
		});
	} else if (request.message == "getAbbreviation") {
		getFocusedTab(function(tab) {
			if (tab) {
				getStoredSiteAbbreviation(tab.url, function(abbreviation) {
					sendResponse({ abbreviation: abbreviation });

					console.log('Sent abbreviation - ' + abbreviation);
				});
			}
		});
	} else if (request.message == "setAbbreviation") {
		getFocusedTab(function(tab) {
			if (tab) {
				setStoredSiteAbbreviation(tab.url, request.abbreviation, function(response) {
					sendResponse({ message: "success" });

					console.log('Setting abbreviation of ' + tab.url + ' to ' + request.abbreviation);
				});
			}
		});
	} else if (request.message == "delete") {
		console.log('Deleting...');

		getFocusedTab(function(tab) {
			if (!tab) {
				return;
			}

			function deleteSiteCallback() {
				if (!request.url) {
					setPopup(true, false, tab.id);
					changeIcon(false, null, tab.id);
				}

				sendResponse({ message: "deleted" });

				console.log('Sent deleted');

				updateAllWindows();
			}

			if (request.url == undefined) {
				console.log("Deleting site " + tab.url);
				deleteSite(tab.url, deleteSiteCallback);
			} else {
				console.log("Deleting site " + request.url);
				deleteSite(request.url, deleteSiteCallback);
			}
		});
	} else if (request.message == "save") {
		console.log('Saving...');

		getFocusedTab(function(tab) {
			createSite(tab.url, request.abbreviation, function(site) {
				saveSite(site, function() {
					sendResponse({ message: "saved" });

					console.log('Sent saved');

					updateAllWindows();
				});
			});
		});
	} else if (request.message == "sitesChanged") {
		updateAllWindows();
	}


	return true;
});

function getFocusedTab(callback) {
	chrome.windows.get(lastFocusedWindowID, { populate: true }, function(window) {
		if (window && window.type != 'normal') {
			return callback(null);
		}

		var tabs = window.tabs;

		for (var j = 0; j < tabs.length; j++) {
			if (tabs[j].active) {
				return callback(tabs[j]);
			}
		}
	});
}

function setPopup(save, error, tabID) {
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

	details.tabId = tabID;

	chrome.browserAction.setPopup(details);
}

/**
 * Sends a Chrome message to all tabs that are Tiles tabs.
 * @param  {String} message The message to send to each tab.
 */
function sendMessageToExtensionTabs(message) {
	chrome.windows.getAll({ populate: true }, function(windows) {
		for (i = 0; i < windows.length; i++) {
			(function() {
				var tabs = windows[i].tabs;

				for (var j = 0; j < tabs.length; j++) {
					if (isExtensionURL(tabs[j].url)) {
						chrome.tabs.sendMessage(tabs[j].id, { "message": message });
					}
				}
			})();
		}
	});
}

/**
 * Updates all of the windows.
 */
function updateAllWindows() {
	chrome.windows.getAll({ populate: true }, function(windows) {
		console.log('Updating all windows...');

		for (var i = 0; i < windows.length; i++) {
			updateWindow(windows[i]);
		}
	});
}

/**
 * Updates all of the tabs in a window.
 * @param  {Window} window The window to update all of its tabs.
 */
function updateWindow(window) {
	if (window && window.type == 'normal') {
		var tabs = window.tabs;

		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].active) {
				updateTab(tabs[i]);

				break;
			}
		}
	}
}

/**
 * Sets the appropriate popup and icon for the tab.
 * @param  {Tab} tab The tab to update its popup and icon.
 */
function updateTab(tab) {
	if (isChromeURL(tab.url)) {
		setPopup(false, true, tab.id);

		changeIcon(false, null, tab.id);
	} else {
		siteExists(tab.url, function(exists) {
			setPopup(!exists, false, tab.id);

			changeIcon(exists, null, tab.id);
		});
	}
}

/**
 * Returns {true} if the URL is a Chrome URL.
 * @param  {[type]}  url The URL to check it it's a Chrome URL.
 * @return {Boolean} Returns {true} if the URL is a Chrome URL.
 */
function isChromeURL(url) {
	return url.substring(0, 6) == 'chrome';
}

/**
 * Returns {true} if the URL is a Chrome extension URL.
 * @param  {String}  url The URL to check if it's a Chrome Extension
 *     URL.
 * @return {Boolean} Returns {true} if the URL is a Chrome Extension
 *     URL.
 */
function isExtensionURL(url) {
	var baseURL = chrome.extension.getURL("/");
	var newTabURL = "chrome://newtab";

	if (url.substring(0, newTabURL.length) == newTabURL) {
		return true;
	}

	return url.substring(0, baseURL.length) == baseURL;
}


/**
 * Returns {true} if a tile exists with the URL.
 * @param  {String}   url      The URL to check if it exists.
 * @param  {Function} callback The callback to call with result.
 */
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

/**
 * Sets the icon for the browser action in the chrome toolbar.
 * @param {boolean} color If {true}, icon will be set to color
 *     version, else icon will be set to grayscale version.
 * @param callback The callback to call after the icon has
 *     been set.
 * @param tabID The related tab ID.
 */
function changeIcon(color, callback, tabID) {
	var details = {};

	if (color) {
		details.path = '../icons/icon-bitty.png';
	} else {
		details.path = '../icons/icon-bitty-gray.png';
	}

	details.tabId = tabID;

	chrome.browserAction.setIcon(details, callback);
}

init();