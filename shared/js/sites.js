function createSite(url, abbreviation, callback) {
	var site = {};

	site.url = url;

	if (abbreviation) {
		site.abbreviation = abbreviation;
	} else {
		site.abbreviation = getHostname(url);
	}

	site.abbreviation = makeAbbreviation(site.abbreviation);

	setSiteColor(site, function(site, error) {
		callback(site, error);
	});
}

function deleteSite(url, callback) {
	getSites(function(sites) {
		for (var i = 0; i < sites.length; i++) {
			if (sites[i].url == url) {
				sites.splice(i, 1);
				break;
			}
		}

		saveSites(sites, callback);
	})
}

function saveSite(site, callback) {
	getSites(function(sites) {
		if (sites) {
			var found = false;

			for (var i = 0; i < sites.length; i++) {
				if (sites[i].url == site.url) {
					sites[i] = site;

					found = true;
					break;
				}
			}

			if (!found) {
				sites.push(site);
			}
		} else {
			sites = [];
			sites.push(site);
		}

		saveSites(sites, callback);
	});
}

function saveSites(sites, callback) {
	chrome.storage.sync.set({"sites": sites}, callback);
}

function getSites(callback) {
	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		if (sites == undefined || sites == null) {
			return callback(null);
		} else {
			if (sites.length == 0) {
				return callback(null);
			}
		}

		return callback(sites);
	});
}

function setSiteColor(site, callback) {
	getFaviconColor(site.url, function(color) {
		var error = false;

		if (!color) {
			error = true;

			color = [0, 0, 0, 0];
		}

		site.color = {
			'red': color[0],
			'green': color[1],
			'blue': color[2],
			'alpha': color[3]
		};

		site.lastUpdated = Date.now();

		return callback(site, error);
	});
}

function siteNeedsColorUpdate(site) {
	const TIME_BEFORE_UPDATE = 1000 * 60 * 60;

	var elapsedTime = Date.now() - site.lastUpdated;

	return (!site.lastUpdated || elapsedTime >= TIME_BEFORE_UPDATE);
}

function makeAbbreviation(string) {
	return string.substring(0, 1).toUpperCase() + string.substring(1, 2).toLowerCase();
}

function isWhiteOrTransparent(color) {
	const TOLERANCE = 20;

	if (color[3] != 255)
		return true;

	return 255 - color[0] <= TOLERANCE
		&& 255 - color[1] <= TOLERANCE
		&& 255 - color[2] <= TOLERANCE;
}

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

	for (var j = 0; j < sumRGB.length; j++) {
		sumRGB[j] = Math.round(sumRGB[j] / age);
	}

	sumRGB = correctLightnessIfNeeded(sumRGB);

	return sumRGB;
}

function getFaviconColor(url, callback) {
	url = urlRemoveFile(url);

	var image = new Image();

	image.onerror = function() {
		console.error("Loading favicon from " + image.src + " failed for " + url);

		callback(null);
	}

	image.onload = function() {
		console.log("Using favicon url " + image.src + " for " + url);

		var context = $("canvas")[0].getContext('2d');
		context.clearRect(0, 0, $("canvas")[0].width, $("canvas")[0].height);
		context.drawImage(image, 0, 0);
		var imageData = context.getImageData(0, 0, image.width, image.height);

		var majorityCandidates = [null, null];
		majorityCandidates[0] = getMajorityColor(imageData);
		majorityCandidates[1] = getMajorityColor(imageData, majorityCandidates[0]);

		if (majorityCandidates[1] == null) {
			callback(majorityCandidates[0]);
		} else if (rgbToHsl(majorityCandidates[0])[1] > rgbToHsl(majorityCandidates[1])[1]) {
			callback(majorityCandidates[0]);
		} else {
			callback(majorityCandidates[1]);
		}
	}

	faviconSearchForDeclared(url, function(path) {
		if (path) {
			image.src = path;
		} else {
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
	}, function() {
		console.error("Could not load url – " + url);

		callback(null);
	});
}

function faviconSearchRoot(url, success, error) {
	// Search for the favicon in the root of the site.
	var domain = getDomain(url);
	var path = domain + '/favicon.ico';

	$.get(path).success(function(data, textStatus, jqXHR) {
		if (isContentImage(jqXHR)) {
			return success(path);
		} else {
			return error();
		}	
	}).error(error);
}

function faviconSearchCurrent(url, success, error) {
	var path = url + '/favicon.ico';

	$.get(path).success(function(data, textStatus, jqXHR) {
		// Search the existing directory
		if (isContentImage(jqXHR)) {
			return success(path);
		} else {
			return error();
		}
	}).error(error);
}

function faviconSearchForDeclared(url, success, error) {
	$.get(url).success(function(data) {
		// Search for explicitly declared icon hrefs
		var links = [];

		var results;
		var regex;

		regex = /<link (.*) ?\/?>/gim;
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
					iconPath = url + '/' + iconPath;
				} else {
					iconPath = url + iconPath;
				}
			}

			$.get(iconPath).success(function(data, textStatus, jqXHR) {
				if (isContentImage(jqXHR)) {
					return success(iconPath);
				} else {
					return error();
				}
			}).error(error);
		} else {
			return success(null);
		}
	}).error(error);
}

function isContentImage(jqXHR) {
	var contentType = jqXHR.getResponseHeader('content-type');

	if (!contentType) {
		return true;
	}

	return contentType.indexOf('image') != -1;
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