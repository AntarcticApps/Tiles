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
			storage.set({ 'nextID': 1 }, function() {
				return callback(0);
			});
		} else {
			storage.set({ 'nextID': items.nextID + 1 }, function() {
				return callback(items.nextID);
			});
		}
	});
}

function storageKeyForID(id) {
	return "s" + id;
}

function storeNewSite(site, callback) {
	getNextID(function(id) {
		site.id = id;
		var key = storageKeyForID(id);
		var data = {};
		data[key] = site;
		storage.set(data, function() {
			return callback(id);
		});
	});
}

function removeSite(id, callback) {
	storage.remove(storageKeyForID(id), callback);
}

function updateSite(id, site, callback) {
	var key = storageKeyForID(id);
	var data = {};
	data[key] = site;
	storage.set(data, function() {
		callback();
	});
}

function addSites(sites, callback) {
	var newIDs = {};

	loop(0, sites.length, function(iteration, callback) {
		storeNewSite(sites[iteration], function(id) {
			newIDs[iteration] = id;
			callback();
		});
	}, function() {
		getSortedSiteIDs(function(ids) {
			for (var j = 0; newIDs[j] != null; j++) {
				ids.push(newIDs[j]);
			}

			setSortedSiteIDs(ids, function() {
				// background color in user CSS
				writeUserStylesheet();

				return callback();
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
			storage.set({ 'ids': [] }, function() {
				return callback([]);
			});
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
	var sites = [];

	getSortedSiteIDs(function(ids) {
		loop(0, ids.length, function(iteration, callback) {
			getSite(ids[iteration], function(site) {
				sites.push(site);
				callback();
			});
		}, function() {
			return callback(sites);
		});
	});
}

function removeSites(sites, callback) {
	getSortedSiteIDs(function(ids) {
		var newIDs = ids;
		loop(0, ids.length, function(iteration, callback) {
			removeSite(sites[iteration], function(id) {
				newIDs.removeElementEqualTo(sites[iteration]);
				callback();
			});
		}, function() {
			setSortedSiteIDs(newIDs, function() {
				writeUserStylesheet();

				return callback();
			});
		});
	});
}

function updateSiteAbbreviation(id, abbreviation, callback) {
	getSortedSiteIDs(function(ids) {
		var i = ids.firstIndexOfElementEqualTo(id);
		getSite(ids[i], function(site) {
			site.abbreviation = abbreviation;
			updateSite(id, site, function() {
				return callback();
			});
		});
	});
}

function updateSiteColor(id, color, callback) {
	if (color instanceof Array) {
		color = colorArrayToObject(color);
	}

	if (!isValidColor(color)) {
		console.error("Invalid color in setSiteColor", id, color);
		return callback();
	}

	getSortedSiteIDs(function(ids) {
		var i = ids.firstIndexOfElementEqualTo(id);
		getSite(ids[i], function(site) {
			site.color = color;
			updateSite(id, site, function() {
				return callback();
			});
		});
	});
}

function updateSiteCustomColor(id, color, callback) {
	if (color && color instanceof Array) {
		color = colorArrayToObject(color);
	}
	
	if (color && !isValidColor(color)) {
		console.error("Invalid color in setSiteCustomColor", id, color);
		return callback();
	}

	getSortedSiteIDs(function(ids) {
		var i = ids.firstIndexOfElementEqualTo(id);
		getSite(ids[i], function(site) {
			if (!color) {
				delete site.customColor;
			} else {
				site.customColor = color;
			}
			updateSite(id, site, function() {
				return callback();
			});
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
				updateSiteColor(sites[iteration].id, color, function() {
					callback();
				});
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

// Ensure a site contains a url, abbreviation, and color and that the color is valid.
function isValidSite(site) {
	if (!site.url || !site.abbreviation || !site.color) {
		return false;
	}

	return isValidColor(site.color);
}

// Ensures the color does not have undefined or null properties.
function isValidColor(color) {
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
		getFileSystem(function(fs) {
			writeToFile(fs, "user.css", "body { background: rgb(0, 0, 0); }");
		});

		storage.remove('backgroundColor', function() {
			callback(null);
		});

		return;
	}	

	storage.set({ 'backgroundColor': color }, function() {
		return callback(color);
	});

	writeUserStylesheet();
}

function getBackgroundColor(callback) {
	storage.get('backgroundColor', function(backgroundColorItems) {
		if (!backgroundColorItems || !backgroundColorItems.backgroundColor) {
			return callback(null);
		}

		return callback(backgroundColorItems.backgroundColor);
	});
}

function writeUserStylesheet() {
	getFileSystem(function(fs) {
		getSitesCount(function(sitesCount) {
			if (sitesCount > 0) {
				getBackgroundColor(function(color) {
					writeToFile(fs, "user.css", "body { background: rgb(" + color['red'] + ", " + color['green'] + ", " + color['blue'] + "); }");
				});
			} else {
				writeToFile(fs, "user.css", "body { background: rgb(0, 0, 0); }");
			}
		});
	});
}

// Get the first two letters our of a string, make uppercase
function makeAbbreviation(string) {
	return string.substring(0, 1).toUpperCase() + string.substring(1, 2).toLowerCase();
}

// Determine if a color is white or transparent
function isWhiteOrTransparent(color) {
	const TOLERANCE = 20;

	if (color[3] != 255)
		return true;

	return 255 - color[0] <= TOLERANCE
		&& 255 - color[1] <= TOLERANCE
		&& 255 - color[2] <= TOLERANCE;
}

// Get the majority color from image data; ignore a certain color
function getMajorityColor(imageData, ignoredColor) {
	var majorityCandidate = null;
	var retainCount = 1;
	var age = 1;
	var sumRGB = [0, 0, 0, 0];

	for (var i = 0; i < imageData.data.length; i += 4) {
		var pixel = [imageData.data[i],
		imageData.data[i + 1],
		imageData.data[i + 2],
		imageData.data[i + 3]];

		if (ignoredColor != undefined && pixelsAreSimilar(ignoredColor, pixel))
			continue;

		if (isWhiteOrTransparent(pixel))
			continue;

		if (majorityCandidate == null) {
			majorityCandidate = pixel;
			for (var j = 0; j < sumRGB.length; j++) {
				sumRGB[j] = pixel[j];
			}
		} else {

			if (pixelsAreSimilar(majorityCandidate, pixel)) {
				retainCount++;

				age++;
				for (var j = 0; j < pixel.length; j++) {
					sumRGB[j] += pixel[j];
				}
			} else {
				retainCount--;
			}

			if (retainCount == 0) {
				majorityCandidate = pixel;
				retainCount = 1;
				age = 1;

				for (var j = 0; j < sumRGB.length; j++) {
					sumRGB[j] = pixel[j];
				}
			}
		}
	}

	if (majorityCandidate == null) {
		return null;
	}

	for (var j = 0; j < sumRGB.length; j++) {
		sumRGB[j] = Math.round(sumRGB[j] / age);
	}

	sumRGB = correctLightnessIfNeeded(sumRGB);

	return sumRGB;
}

function getFaviconColor(url, callback) {
	var image = new Image();

	image.onerror = function() {
		console.error("Loading favicon from " + image.src + " failed for " + url);

		callback(null);
	}

	image.onload = function() {
		console.log("Using favicon url " + image.src + " for " + url);

		var canvas = document.getElementsByTagName("canvas")[0];

		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height'));
		context.drawImage(image, 0, 0);
		var imageData = context.getImageData(0, 0, image.width, image.height);

		var majorityCandidates = [null, null];
		majorityCandidates[0] = getMajorityColor(imageData);
		majorityCandidates[1] = getMajorityColor(imageData, majorityCandidates[0]);

		console.log("Colors generated: " + majorityCandidates);

		if (majorityCandidates[1] == null) {
			callback(majorityCandidates[0]);
		} else if (rgbToHsl(majorityCandidates[0])[1] >= rgbToHsl(majorityCandidates[1])[1]) {
			callback(majorityCandidates[0]);
		} else {
			callback(majorityCandidates[1]);
		}
	}

	url = urlRemoveFile(url);

	function faviconNotDeclared() {
		faviconSearchCurrent(url, function(path) {
			image.src = path;
		}, function() {
			faviconSearchRoot(url, function(path) {
				image.src = path;
			}, function() {
				console.error("Could not find any icons for url - " + url);

				callback(null);
			})
		});
	}

	faviconSearchForDeclared(url, function(path) {
		if (path) {
			image.src = path;
		} else {
			faviconNotDeclared();
		}
	}, function() {
		console.error("Could not load url - " + url);

		faviconNotDeclared();
	});
}

function faviconSearchRoot(url, success, error) {
	// Search for the favicon in the root of the site.
	var domain = getDomain(url);
	var path = domain + '/favicon.ico';

	makeHTTPRequest(path, function(data, contentType) {
		if (isContentImage(contentType)) {
			return success(path);
		} else {
			return error();
		}
	}, function(status) {
		return error();
	});
}

function faviconSearchCurrent(url, success, error) {
	var path = url + '/favicon.ico';

	makeHTTPRequest(path, function(data, contentType) {
		// Search the existing directory
		if (isContentImage(contentType)) {
			return success(path);
		} else {
			return error();
		}
	}, function(status) {
		return error();
	});
}

function faviconSearchForDeclared(url, success, error) {
	makeHTTPRequest(url, function(data, contentType) {
		// Search for explicitly declared icon hrefs
		var links = [];

		var results;
		var regex;

		regex = /<link ([^<>]*) ?\/?>/gim;
		while ((results = regex.exec(data)) !== null) {
			links.push(results[1]);
		}

		var hrefs = {};
		for (var i = 0; i < links.length; i++) {
			var relations = /rel="([\w -]*)"/.exec(links[i]);

			// If there is no relation, it's probably not an icon
			if (relations) {
				relations = relations[1].split(' ');

				var hrefRegex = /href="([^ ]*)"/.exec(links[i]);

				if (!hrefRegex) {
					continue;
				}
				
				var href = hrefRegex[1];

				for (var j = 0; j < relations.length; j++) {
					relations[j] = relations[j].toLowerCase();
					
					if (relations[j] != 'icon') { // && relations[j] != 'apple-touch-icon') {
						continue;
					}

					if (!hrefs[relations[j]]) {
						hrefs[relations[j]] = [];
					}

					hrefs[relations[j]].push(href);
				}
			}
		}

		var iconPath;
		if (hrefs['apple-touch-icon']) {
			iconPath = hrefs['apple-touch-icon'][0];
		} else if (hrefs['icon']) {
			iconPath = hrefs['icon'][0];
		}

		if (iconPath) {
			if (iconPath.substring(0, 2) == '//') {
				iconPath = 'http:' + iconPath;
			} else if (iconPath.substring(0, 1) == '/') {
				iconPath = 'http://' + getHostname(url) + iconPath;
			} else if (iconPath.substring(0, 4) != 'http') {
				if (url.substring(url.length - 1) != '/') {
					var domainResults = domainRegex(url);

					iconPath = domainResults[1] + domainResults[3] + '/' + iconPath;
				} else {
					iconPath = url + iconPath;
				}
			}

			makeHTTPRequest(iconPath, function(data, contentType) {
				if (isContentImage(contentType)) {
					return success(iconPath);
				} else {
					return error();
				}
			}, function(status) {
				return error();
			});
		} else {
			return success(null);
		}
	}, function(status) {
		return error();
	});
}

function makeHTTPRequest(url, successCallback, errorCallback) {
	var http = new XMLHttpRequest();

	http.ontimeout = function() {
		return errorCallback(null);
	}

	http.onreadystatechange = function() {
		if (http.readyState == 4) {
			if (http.status == 200) {
				return successCallback(http.responseText, http.getResponseHeader('content-type'));
			} else {
				return errorCallback(http.status);
			}
		}
	}

	http.open('GET', url, true);
	http.timeout = 500;
	http.send(null);
}

function isContentImage(contentType) {
	if (!contentType) {
		return true;
	}

	return contentType.indexOf('html') == -1;
}

function urlRemoveFile(url) {
	for (var i = url.length; i >= 0; i--) {
		if (url[i] == '/') {
			return url.slice(0, i + 1);
		}
	}

	return url;
}

function pixelsAreSimilar(a, b) {
	const TOLERANCE = 0.01;

	var aHSL = rgbToHsl(a);
	var bHSL = rgbToHsl(b);

	return Math.abs(aHSL[0] - bHSL[0]) <= TOLERANCE;
}

function colorArrayToObject(arr) {
	if (arr.length == 4) {
		return {
			red: arr[0],
			green: arr[1],
			blue: arr[2],
			alpha: arr[3]
		};
	} else {
		return {
			red: arr[0],
			green: arr[1],
			blue: arr[2],
			alpha: 255
		};	
	}
}

/**
 * Source: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(rgb){
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max == min){
	    h = s = 0; // achromatic
	} else {
	    var d = max - min;
	    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	    
	    switch(max) {
	        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	        case g: h = (b - r) / d + 2; break;
	        case b: h = (r - g) / d + 4; break;
	    }
	   
	    h /= 6;
	}

	return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(hsl){
	var h = hsl[0], s = hsl[1], l = hsl[2];
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
        alpha: 255
    } : null;
}

function safeAlphaHslToRgb(hsl) {
	var rgb = hslToRgb(hsl);
	var safeRgb = [0, 0, 0, 255]
	for (var i = 0; i < hsl.length; i++) {
		safeRgb[i] = Math.floor(rgb[i]);
	}
	return safeRgb;
}

function averagePixels(a, b, ratio) {
	var weight;
	ratio++;
	if (ratio <= 0) {
		return null;
	} else {
		weight = 1 - (1 / ratio);
	}

	var avg = [];
	for (var i = 0; i < a.length; i++) {
		avg[i] = Math.round( (weight * a[i]) + ((1 - weight) * b[i]) );
	}

	return avg;
}

function correctLightnessIfNeeded(rgb) {
	const MAX_BRIGHTNESS = 0.8;

	var hsl = rgbToHsl(rgb);
	if (hsl[2] > MAX_BRIGHTNESS) {
		hsl[2] = MAX_BRIGHTNESS;
		rgb = safeAlphaHslToRgb(hsl);
	}

	return rgb;
}