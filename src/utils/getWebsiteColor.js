function domainRegex(url) {
    var domainRegex = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/igm;
    var result = domainRegex.exec(url);

    return result;
}

function getDomain(url) {
    return /^((([^:\/?#]+):)?(\/\/([^\/?#]*))?)/igm.exec(url)[0];
}

function getHostname(url) {
    if (url.substring(0, 7) == "file://") {
        return "localhost";
    }

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
        return finishCallback();
    }
}

function async_loop(start, end, operation, finishCallback) {
    if (end < start) {
        finishCallback();
    }

    var operationsToComplete = (end - start);
    for (var i = start; i < end; i++) {
        operation(i, function() {
            operationsToComplete--;
            if (operationsToComplete == 0) {
                return finishCallback();
            }
        });
    }
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

        var canvas = document.createElement("canvas");

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

        canvas.remove();
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
    if (!arr) {
        return arr;
    }

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
    var safeRgb = [0, 0, 0, 255];
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

function colorsAreEqual(a, b) {
    if (!a || !b) {
        return false;
    }

    return a.red == b.red
        && a.green == b.green
        && a.blue == b.blue
        && a.alpha == b.alpha;
}

module.exports = getFaviconColor;
