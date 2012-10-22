// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

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

// Delete the site from all of the sites, given the url.
function deleteSite(url, callback) {
	getSites(function(sites) {
		for (var i = 0; i < sites.length; i++) {
			if (sites[i].url == url) {
				sites.splice(i, 1);
				break;
			}
		}

		saveSites(sites, callback);
	});
}

// Save the given site object. Replace if URL is found in existing sites.
function saveSite(site, callback) {
	getSites(function(sites) {
		if (sites) {
			// If sites exists, ensure we don't make a duplicate.
			var found = false;

			for (var i = 0; i < sites.length; i++) {
				if (sites[i].url == site.url) {
					sites[i] = site;

					found = true;
					break;
				}
			}

			if (!found) {
				// We didn't find it, so just add a new site
				sites.push(site);
			}
		} else {
			// Create a new sites array.
			sites = [];
			sites.push(site);
		}

		saveSites(sites, callback);
	});
}

// Save the sites array to Chrome storage
function saveSites(sites, callback) {
	if (callback == undefined) {
		callback = function() { };
	}

	// Ensure the site is a valid so we don't corrupt the database
	for (var i = 0; i < sites.length; i++) {
		if (!isValidSite(sites[i])) {
			console.error("Site is not valid on save: " + sites[i].url);
			console.log(sites[i]);
			sites.remove(i);
		}
	}
	
	// Update the sites size entry
	chrome.storage.sync.set({'sitesSize': sites.length}, function() {
		if (sites.length == 0) {
			// If we have no sites anymore, just update any pages that are currently showing sites
			chrome.extension.sendMessage({ message:"sitesChanged" }, function() {});

			return callback();
		}

		// Create the key/value pairs in the database for site/data
		var pairs = {};
		for (var i = 0; i < sites.length; i++) {
			var key = 'site-' + i;
			pairs[key] = sites[i];
		}

		// Save and update pages currently showing sites
		chrome.storage.sync.set(pairs, function() {
			chrome.extension.sendMessage({ message:"sitesChanged" }, function() {});

			return callback();
		});
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

// Get all the sites currently in the database
function getSites(callback) {
	getSitesSize(function (sitesSize) {
		// Ok, we have sites to get...
		// Determine the key for each site, and get the data for that key from the database
		
		if (sitesSize <= 0) {
			return callback(null);
		}

		var sitesList = [];
		for (var i = 0; i < sitesSize; i++) {
			sitesList[i] = 'site-' + i;
		}

		// Get the values for the keys from the database
		chrome.storage.sync.get(sitesList, function(sitesItems) {
			if (sitesItems == null) {
				// No items exist for some reason
				// Save sites size as zero and callback with null
				
				chrome.storage.sync.set({'sitesSize': 0}, function() {
					return callback(null);
				});
			} else {
				// Put all the sites in a array indexed by id

				var sites = [];
				for (var j = 0; j < sitesSize; j++) {
					sites[j] = sitesItems['site-' + j];
				}

				return callback(sites);
			}
		});
	});
}

function getSitesSize(callback) {
	chrome.storage.sync.get('sitesSize', function(sitesSizeItems) {
		if (sitesSizeItems == null || sitesSizeItems.sitesSize == 0) {
			// Something is wrong, save the sites size as zero and callback with null
			
			chrome.storage.sync.set({'sitesSize': 0}, function() {
				return callback(0);
			});
		} else {
			return callback(sitesSizeItems.sitesSize);
		}
	});
}

// Get the abbreviation for a site in the database
function getStoredSiteAbbreviation(url, callback) {
	getSites(function(sites) {
		if (sites) {
			for (var i = 0; i < sites.length; i++) {
				if (sites[i].url == url) {
					return callback(sites[i].abbreviation);
				}
			}
		} else {
			return callback(null);
		}
	});
}

// Set the abbreviation for a site in the database
function setStoredSiteAbbreviation(url, abbreviation, callback) {
	getSites(function(sites) {
		if (sites) {
			for (var i = 0; i < sites.length; i++) {
				if (sites[i].url == url) {
					sites[i].abbreviation = abbreviation;
					saveSite(sites[i], callback);
					return;
				}
			}
		} else {
			return callback(null);
		}
	});
}

// Set the custom color for a site in the database
function setStoredSiteCustomColor(url, customColor, callback) {
	getSites(function(sites) {
		if (sites) {
			for (var i = 0; i < sites.length; i++) {
				if (sites[i].url == url) {
					sites[i].customColor = customColor;
					saveSite(sites[i], callback);
					return;
				}
			}
		} else {
			return callback(null);
		}
	});
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

	site.color = {
		'red': color[0],
		'green': color[1],
		'blue': color[2],
		'alpha': color[3]
	};
}

function updateFaviconColorForAllSites(callback) {
	getSites(function(sites) {
		if (!sites) {
			callback();
		}

		var saved = false;
		var numberOfSites = sites.length;

		function saveIfReady() {
			if (numberOfSites <= 0 && !saved) {
				saved = true;

				saveSites(sites, function() {
					callback();
				});
			}
		}

		for (var i = 0; i < sites.length; i++) {
			(function(site) {
				getFaviconColor(site.url, function(color) {
					setSiteColor(site, color);

					numberOfSites--;

					saveIfReady();
				});
			})(sites[i]);
		}
	});
}

function setBackgroundColor(color, callback) {
	if (!color) {
		getFileSystem(function(fs) {
			writeToFile(fs, "user.css", "body { background: rgb(0, 0, 0); }");
		});

		chrome.storage.sync.remove('backgroundColor', function() {
			callback(null);
		});

		return;
	}

	getFileSystem(function(fs) {
		writeToFile(fs, "user.css", "body { background: rgb(" + color['red'] + ", " + color['green'] + ", " + color['blue'] + "); }");
	});

	chrome.storage.sync.set({ 'backgroundColor': color }, function() {
		return callback(color);
	});	
}

function getBackgroundColor(callback) {
	getSitesSize(function (sitesSize) {
		if (sitesSize == 0) {
			return callback(null);
		}

		chrome.storage.sync.get('backgroundColor', function(backgroundColorItems) {
			if (!backgroundColorItems || !backgroundColorItems.backgroundColor) {
				return callback(null);
			}

			return callback(backgroundColorItems.backgroundColor);
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