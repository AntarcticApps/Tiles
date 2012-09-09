chrome.tabs.onActivated.addListener(function(info) {
	chrome.tabs.get(info.tabId, function(tab) {
		updateIcon(tab.url);
	});
});

chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
	if (changeInfo.active) {
		updateIcon(tab.url);
	}
});

function updateIcon(url) {
	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		changeIcon(false, null);

		if (url.substring(url.length - 1) == '/') {
			url = url.substring(0, url.length - 1);
		}

		if (sites) {
			for (var i = 0; i < sites.length; i++) {
				if (sites[i].url == url) {
					changeIcon(true, null);
					break;
				}
			}
		}
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