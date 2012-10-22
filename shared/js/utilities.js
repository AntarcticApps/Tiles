function domainRegex(url) {
	var domainRegex = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/igm;
	var result = domainRegex.exec(url);

	return result;
}

function getDomain(url) {
	return /^((([^:\/?#]+):)?(\/\/([^\/?#]*))?)/igm.exec(url)[0];
}

function getHostname(url) {
	var hostname = domainRegex(url)[4];

	if (hostname.substring(0, 4) == "www.") {
		hostname = hostname.substring(4);
	}

	return hostname;
}

function loop(iteration, end, operation, finishCallback) {
	if (iteration < end) {
		operation(iteration, function() {
			loop(iteration + 1, end, operation, finishCallback);
		});
	} else {
		finishCallback();
	}
}

function async_loop(start, end, operation, finishCallback) {
	var operationsToComplete = (end - start);
	for (var i = start; i < end; i++) {
		operation(i, function() {
			operationsToComplete--;
			if (operationsToComplete == 0) {
				finishCallback();
			}
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

Array.prototype.firstIndexOfElementEqualTo = function(element) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == element) {
			return i;
		}
	}
}

Array.prototype.removeElementEqualTo = function(element) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == element) {
			return this.removeAtIndex(i);
		}
	}
}

Array.prototype.removeAtIndex = function(index) {
	return this.splice(index, 1)[0];
};

Array.prototype.insertAtIndex = function(element, index) {
	this.splice(index, 0, element);
}