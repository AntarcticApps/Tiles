const SITES_ADDED_MESSAGE = "sites_added";
const SITES_REMOVED_MESSAGE = "sites_removed";
const SITE_UPDATED_MESSAGE = "sites_updated";
const BACKGROUND_COLOR_UPDATED_MESSAGE = "background_color_updated";

// Create a site given the url, abbreviation, color, and a callback.
//
// Callback is required due to getting the site color requiring an async HTTP request
// (only if color is no null)
function createSite(url, abbreviation, color, callback) {
	var site = {};

	if (url) {
		site.url = url;
	} else {
		site.url = '';
	}

	if (abbreviation) {
		site.abbreviation = abbreviation;
	} else {
		site.abbreviation = getHostname(url);
	}

	site.abbreviation = makeAbbreviation(site.abbreviation);

	if (!color) { 
		getFaviconColor(site.url, function(color) {
			setSiteColor(site, color);

			callback(site);
		});
	} else {
		setSiteColor(site, color);

		callback(site);
	}
}

// Set the site color for a given site object
function setSiteColor(site, color) {
	if (!color) {
		color = [0, 0, 0, 255];
	} else {
		if (color.length != 4) {
			return;
		}
	}

	site.color = colorArrayToObject(color);
}

function getNextID(callback) {
	storage.get('nextID', function(items) {
		if (!items || !items.nextID) {
			return callback(0);
		} else {
			return callback(items.nextID);
		}
	});
}

function storageKeyForID(id) {
	return "s" + id;
}

function updateSite(id, site, callback) {
	var key = storageKeyForID(id);
	var data = {};
	data[key] = site;
	storage.set(data, function() {
		emitMessage(SITE_UPDATED_MESSAGE, id);
		callback();
	});
}

function addSites(sites, callback) {
	var data = {};
	var newIDs = [];

	getNextID(function(id) {
		data.nextID = id + sites.length;

		loop(0, sites.length, function(iteration, callback) {
			sites[iteration].id = id;
			var siteKey = storageKeyForID(id);
			data[siteKey] = sites[iteration];

			newIDs.push(id);

			id++;

			callback();
		}, function() {
			getSortedSiteIDs(function(ids) {
				for (var j = 0; newIDs[j] != null; j++) {
					ids.push(newIDs[j]);
				}

				data.ids = ids;

				storage.set(data, function() {
					emitMessage(SITES_ADDED_MESSAGE);

					return callback();
				});
			});
		});
	});
}

function getSitesCount(callback) {
	getSortedSiteIDs(function(ids) {
		return callback(ids.length);
	});
}

function getSortedSiteIDs(callback) {
	storage.get('ids', function(items) {
		if (!items || !items.ids) {
			return callback([]);
		} else {
			return callback(items.ids);
		}
	});
}

function setSortedSiteIDs(ids, callback) {
	storage.set({ 'ids': ids }, callback);
}

function reorderSite(oldIndex, newIndex, callback) {
	getSortedSiteIDs(function(ids) {
		var removed = ids.removeAtIndex(oldIndex);
		ids.insertAtIndex(removed, newIndex);
		setSortedSiteIDs(ids, function() {
			return callback();
		});
	});
}

function getSite(id, callback) {
	storage.get(storageKeyForID(id), function(items) {
		if (!items || !items[storageKeyForID(id)]) {
			return callback(null);
		} else {
			return callback(items[storageKeyForID(id)]);
		}
	});
}

function getAllSites(callback) {
	var storageKeys = [];
	var sites = [];

	getSortedSiteIDs(function(ids) {
		var storageKeys = [];
		for (var i = 0; i < ids.length; i++) {
			storageKeys.push(storageKeyForID(ids[i]));
		}

		storage.get(storageKeys, function(items) {
			if (!items) {
				return callback([]);
			}

			for (var i = 0; i < storageKeys.length; i++) {
				if (items[storageKeys[i]]) {
					sites.push(items[storageKeys[i]]);
				}
			}

			return callback(sites);
		});
	});
}

function removeSites(siteIDs, callback) {
	var storageKeys = [];
	for (var i = 0; i < siteIDs.length; i++) {
		storageKeys.push(storageKeyForID(siteIDs[i]));
	}

	storage.remove(storageKeys, function() {
		getSortedSiteIDs(function(ids) {
			for (var i = 0; i < siteIDs.length; i++) {
				ids.removeElementEqualTo(siteIDs[i]);
			}

			setSortedSiteIDs(ids, function() {
				emitMessage(SITES_REMOVED_MESSAGE);

				return callback();
			});
		});
	});
}

function updateSiteAbbreviation(id, abbreviation, callback) {
	getSite(id, function(site) {
		site.abbreviation = abbreviation;
		updateSite(id, site, function() {
			return callback();
		});
	});
}

function updateSiteColor(id, color, callback) {
	if (color == null) {
		color = [0, 0, 0, 255];
	}

	if (color instanceof Array) {
		color = colorArrayToObject(color);
	}

	if (!isValidColor(color)) {
		console.error("Invalid color in updateSiteColor", id, color);
		return callback();
	}

	getSite(id, function(site) {
		site.color = color;
		updateSite(id, site, function() {
			return callback();
		});
	});
}

function updateSiteCustomColor(id, color, callback) {
	if (color && color instanceof Array) {
		color = colorArrayToObject(color);
	}
	
	if (color && !isValidColor(color)) {
		console.error("Invalid color in updateSiteCustomColor", id, color);
		return callback();
	}

	getSite(id, function(site) {
		if (!color) {
			delete site.customColor;
		} else {
			site.customColor = color;
		}
		updateSite(id, site, function() {
			return callback();
		});
	});
}

function updateFaviconColorForAllSites(callback) {
	getAllSites(function(sites) {
		if (!sites) {
			callback(false);
		}

		async_loop(0, sites.length, function(iteration, callback) {
			getFaviconColor(sites[iteration].url, function(color) {
				var color = colorArrayToObject(color);
				if (!colorsAreEqual(sites[iteration].color, color)) {
					updateSiteColor(sites[iteration].id, color, function() {
						callback();
					});
				} else {
					callback();
				}
			});
		}, function() {
			callback(true);
		});
	});
}

function getSiteForURL(url, callback) {
	getAllSites(function(sites) {
		if (!sites || sites.length == 0) {
			return callback(null);
		}

		for (var i = 0; i < sites.length; i++) {
			if (sites[i].url == url) {
				return callback(sites[i]);
			}
		}

		return callback(null);
	});
}

function getIDForURL(url, callback) {
	getSiteForURL(url, function(site) {
		return callback(site.id);
	});
}

function getSiteAbbreviationForURL(url, callback) {
	var site = getSiteForURL(url, function(site) {
		return callback(site.abbreviation);
	});
}

/**
 * Returns {true} if a tile exists with the URL.
 * @param  {String}   url      The URL to check if it exists.
 * @param  {Function} callback The callback to call with result.
 */
function siteExistsWithURL(url, callback) {
	getAllSites(function(sites) {
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

// Ensure a site contains a url, abbreviation, and color and that the color is valid.
function isValidSite(site) {
	if (!site.url || !site.abbreviation || !site.color) {
		return false;
	}

	return isValidColor(site.color);
}

// Ensures the color does not have undefined or null properties.
function isValidColor(color) {
	if (!color) {
		return false;
	}

	if (color.red == undefined
		|| color.green == undefined
		|| color.blue == undefined
		|| color.alpha == undefined) {
		return false;
	}

	if (color.red == null
		|| color.green == null
		|| color.blue == null
		|| color.alpha == null) {
		return false;
	}

	return true;
}

function setBackgroundColor(color, callback) {
	if (!color) {
		storage.remove('backgroundColor', function() {
			writeUserStylesheet(function() {
				emitMessage(BACKGROUND_COLOR_UPDATED_MESSAGE);

				return callback(null);
			});
		});
	} else {	
		storage.set({ 'backgroundColor': color }, function() {
			writeUserStylesheet(function() {
				emitMessage(BACKGROUND_COLOR_UPDATED_MESSAGE);

				return callback(color);
			});
		});
	}
}

function getBackgroundColor(callback) {
	storage.get('backgroundColor', function(backgroundColorItems) {
		if (!backgroundColorItems || !backgroundColorItems.backgroundColor) {
			return callback(null);
		}

		return callback(backgroundColorItems.backgroundColor);
	});
}

// Get the first two letters our of a string, make uppercase
function makeAbbreviation(string) {
	string = string.trim();
	return string.substring(0, 1).toUpperCase() + string.substring(1, 2).toLowerCase();
}

function writeUserStylesheet(callback) {
	getFileSystem(function(fs) {
		getSitesCount(function(sitesCount) {
			if (sitesCount > 0) {
				getBackgroundColor(function(color) {
					if (!color) {
						writeToFile(fs, "user.css", "body { background: rgb(0, 0, 0) !important; }");
					} else {
						writeToFile(fs, "user.css", "body { background: rgb(" + color['red'] + ", " + color['green'] + ", " + color['blue'] + ") !important; }");
					}
					callback();
				});
			} else {
				writeToFile(fs, "user.css", "body { background: rgb(0, 0, 0) !important; }");
			}
		});
	});
}