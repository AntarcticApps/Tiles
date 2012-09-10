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

function getFaviconColor(url, callback) {
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

		var majorityCandidate = null;
		var retainCount = 1;

		const TOLERANCE = 10;

		var imageData = context.getImageData(0, 0, image.width, image.height);

		for (var i = 0; i < imageData.data.length; i += 4) {
			var pixel = [imageData.data[i],
			imageData.data[i + 1],
			imageData.data[i + 2],
			imageData.data[i + 3]];

			if (majorityCandidate == null && !isWhiteOrTransparent(pixel)) {
				majorityCandidate = pixel;
			}

			if (majorityCandidate) {
				if (pixelsAreSimilar(majorityCandidate, pixel) && !isWhiteOrTransparent(pixel)) {
					retainCount++;

					majorityCandidate = averagePixels(majorityCandidate, pixel, retainCount);
				} else if (!isWhiteOrTransparent(pixel)) {
					retainCount--;
				}

				if (retainCount == 0) {
					majorityCandidate = pixel;

					retainCount = 1;
				}
			}
		}

		callback(majorityCandidate);
	}

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

				var href = /href="([^ ]*)"/.exec(links[i])[1];

				for (var j = 0; j < relations.length; j++) {
					if (relations[j] != 'icon' && relations[j] != 'apple-touch-icon') {
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

			// Pick an icon that isn't missing it's preceding '/'
			for (var i = 0; i < hrefs['icon'].length; i++) {
				iconPath = hrefs['icon'][i];

				if (iconPath.substring(0, 1) != '/' && iconPath.substring(0, 4) != 'http') {
					continue;
				} else {
					break;
				}
			}
		}

		if (iconPath) {
			if (iconPath.substring(0, 2) == '//') {
				image.src = 'http:' + iconPath;
			} else if (iconPath.substring(0, 1) == '/') {
				image.src = 'http://' + getHostname(url) + iconPath;
			} else {
				image.src = iconPath;
			}

			return;
		}

		$.get(url + '/favicon.ico').success(function() {
			// Search the existing directory
			image.src = url + '/favicon.ico';
		}).error(function() {
			// Search for the favicon in the root of the site.
			var domain = getDomain(url);

			$.get(domain + '/favicon.ico').success(function() {
				image.src = domain + '/favicon.ico';
			}).error(function() {
				console.error("Could not find any icons for url – " + url);
				callback(null);
			})
		});
	}).error(function() {
		console.error("Could not load url – " + url);

		callback(null);
	});
}

function pixelsAreSimilar(a, b) {
	const TOLERANCE = 0.001;

	var aHSL = rgbToHsl(a[0], a[1], a[2]);
	var bHSL = rgbToHsl(b[0], b[1], b[2]);

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
function rgbToHsl(r, g, b){
	r /= 255, g /= 255, b /= 255;

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