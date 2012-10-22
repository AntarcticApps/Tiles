/**
 * Sends a Chrome message to all tabs that are Tiles tabs.
 * @param  {String} message The message to send to each tab.
 */
function sendMessageToExtensionTabs(message, ignoreCurrent) {
	if (ignoreCurrent == undefined) {
		ignoreCurrent = true;
	}

	chrome.tabs.getCurrent(function(currentTab) {
		chrome.windows.getAll({ populate: true }, function(windows) {
			for (i = 0; i < windows.length; i++) {
				(function() {
					var tabs = windows[i].tabs;

					for (var j = 0; j < tabs.length; j++) {
						if (ignoreCurrent && currentTab && (currentTab.id == tabs[j].id)) {
							continue;
						}

						if (isExtensionURL(tabs[j].url)) {
							chrome.tabs.sendMessage(tabs[j].id, { "message": message });
						}
					}
				})();
			}
		});
	});
}