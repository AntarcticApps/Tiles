var lastFocusedWindowID = 1;

function init() {
	console.log("Tiles background page started");

	chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT, { populate: true }, function(window) {
		if (window.type == 'normal') {
			lastFocusedWindowID = chrome.windows.WINDOW_ID_CURRENT;
		}

		console.log("Last focused window is now ID " + window.id);

		updateWindow(window);
	});

	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

	function onInitFs(fs) {
		console.log('Opened file system: ' + fs.name);

		fs.root.getFile('user.css', {create: true}, function(fileEntry) {
			// fileEntry.isFile === true
			// fileEntry.name == 'log.txt'
			// fileEntry.fullPath == '/log.txt'
			
			console.log(fileEntry);

			console.log(fileEntry.toURL());

			fileEntry.createWriter(function(fileWriter) {

		      fileWriter.onwriteend = function(e) {
		      	console.log(e);
		        console.log('Write completed.');
		      };

		      fileWriter.onerror = function(e) {
		        console.log('Write failed: ' + e.toString());
		      };

		      // Create a new Blob and write it to log.txt.
		      var blob = new Blob(['body { display:none; }'], {type: 'text/plain'});

		      fileWriter.write(blob);

		    }, errorHandler);

		}, errorHandler);
	}

	function errorHandler(e) {
	  var msg = '';

	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };

	  console.log('Error: ' + msg);
	}


	window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
		console.log(grantedBytes);
		window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
	}, function(e) {
		console.log('Error', e);
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

		console.log("Last focused window is now ID " + window.id);

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
	} else if (request.message == "saveSites") {
		console.log('Saving all sites...');

		saveSites(request.sites, function() {
			sendResponse({ message: "saved" });

			console.log('Sent saved');

			updateAllWindows();
		});
	} else if (request.message == "setBackgroundColor") {
		console.log('Setting background color...');

		setBackgroundColor(request.color, function() {
			sendResponse({ message: "saved" });

			console.log('Sent saved');

			update();
		});
	} else if (request.message == "getBackgroundColor") {
		console.log('Getting background color...');

		getBackgroundColor(function(backgroundColor) {
			sendResponse({ color: backgroundColor });

			console.log('Sent color');
		});
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

	// console.log('Popup is set to ' + details.popup);
}

function update() {
	getFocusedTab(function(tab) {
		if (tab) {
			setPopup(false, false, tab.id);
			changeIcon(true, null, tab.id);
		}

		sendMessageToExtensionTabs("update");
	});
}

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

function updateAllWindows() {
	chrome.windows.getAll({ populate: true }, function(windows) {
		console.log('Updating all windows...');

		for (var i = 0; i < windows.length; i++) {
			updateWindow(windows[i]);
		}
	});
}

function updateWindow(window) {
	if (window && window.type == 'normal') {
		var tabs = window.tabs;

		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].active) {
				if (window.focused) {
					console.log("Window ID " + window.id + " is focused on active tab on ID: " + tabs[i].id + " which is at " + tabs[i].url);
				} else {
					console.log("Window ID " + window.id + " is has active tab ID: " + tabs[i].id + " which is at " + tabs[i].url);
				}

				updateTab(tabs[i]);

				break;
			}
		}
	}
}

function updateTab(tab) {
	console.log("Updating tab ID: " + tab.id + " which is at " + tab.url);

	if (isChromeURL(tab.url)) {
		setPopup(false, true, tab.id);
	} else {
		siteExists(tab.url, function(exists) {
			setPopup(!exists, false, tab.id);

			changeIcon(exists, null, tab.id);
		});
	}
}

function isChromeURL(url) {
	return url.substring(0, 6) == 'chrome';
}

function isExtensionURL(url) {
	var baseURL = chrome.extension.getURL("/");
	var newTabURL = "chrome://newtab";

	if (url.substring(0, newTabURL.length) == newTabURL) {
		return true;
	}

	return url.substring(0, baseURL.length) == baseURL;
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

function changeIcon(colors, callback, tabID) {
	var details = {};

	if (colors) {
		details.path = '../icons/icon-bitty.png';
	} else {
		details.path = '../icons/icon-bitty-gray.png';
	}

	console.log("Changing icon for " + tabID + " to " + details.path);

	details.tabId = tabID;

	chrome.browserAction.setIcon(details, callback);
}

init();