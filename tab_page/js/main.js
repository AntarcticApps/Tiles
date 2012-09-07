var sites;

document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {	
	var siteDiv = document.getElementById('sites');
	// var siteList = siteDiv.getElementsByTagName('div')[0];

	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		document.addEventListener("DOMNodeInserted", layout, false);

		if (sites.length == 0) {
			alert("Oh noez!");
		}

		for (var i = 0; i < sites.length; i++) {
			(function() {
				var site = sites[i];

				var link = createSite(site.abbreviation, site.url);

				var color = site.color;

				if (color) {
					link.style.background = 'rgba(' + color.red +', ' + color.green + ', ' + color.blue + ', ' + 1 +')';
					console.log(site.url, link.style.color);
				}
								
				link.onclick = function(e) {
					if (e.metaKey == false) {
						var sitesElement = document.getElementById("sites");

						link.setAttribute("class", "animate");
						var sitesTransform = sitesElement.style.webkitTransform;
						var floatRegex = /scale\(([0-9]*\.?[0-9]*), ?([0-9]*\.?[0-9]*)\)/;
						var sitesScale = floatRegex.exec(sitesTransform)[1];

						const ROW_HEIGHT = 220;
						const COL_WIDTH = 220;
						const ROW_OUTER_HEIGHT = 228;
						const COL_OUTER_WIDTH = 228;
						const COLS = 3;
						const CHANGE_LOCATION_DELAY = 200;

						var scaleX = window.innerWidth / sitesScale / COL_WIDTH;
						var scaleY = window.innerHeight / sitesScale / ROW_HEIGHT;

						var sitesMidX = parseInt(sitesElement.style.width) / 2;
						var sitesMidY = ROW_OUTER_HEIGHT * COLS / 2;

						var centerX = link.offsetLeft + COL_WIDTH / 2;
						var centerY = link.offsetTop + ROW_HEIGHT / 2;

						var translateX = sitesMidX - centerX;
						var translateY = sitesMidY - centerY;
						link.style.webkitTransform = "translate(" + translateX + "px, " + translateY + "px) scale(" + scaleX + ", " + scaleY + ")";
						link.style.background = "white";

						setTimeout(function() {
							window.location = site.url;
						}, CHANGE_LOCATION_DELAY);
					} else {
						chrome.tabs.create({ 'url': site.url, active: false });
					}
				}

				siteDiv.appendChild(link);
			})();
		}
	});
	
	var optionsLink = document.createElement("a");
	optionsLink.setAttribute("class", "settings btn");
	optionsLink.onclick = function() {
		chrome.tabs.create({
			url: "options/options.html"
		});
	}

	optionsLink.innerHTML = "Options";
	document.body.appendChild(optionsLink);

	window.onresize = function() {
		layout();
	};

	chrome.contextMenus.removeAll(function() {
		chrome.contextMenus.create({
		    "title": "Paero Options",
		    "documentUrlPatterns": [window.location.origin + "/*"],
		    "contexts": ["page", "link"],
		    "onclick" : function() {
				chrome.tabs.create({
					url: "options/options.html"
				});
			}
		});
	});
}

function layout() {
	document.removeEventListener("DOMNodeInserted", layout);
	
	var sitesElement = document.getElementById("sites");

	const MARGIN = 8;
	const ROW_HEIGHT = 220 + MARGIN;
	const COL_WIDTH = 220 + MARGIN;
	const MAX_HEIGHT = window.innerHeight - MARGIN;
	const MAX_WIDTH = window.innerWidth - MARGIN;

	var cols = Math.ceil(sites.length / 3);
	var shouldWidth = cols * COL_WIDTH;
	sitesElement.style.width = shouldWidth + "px";

	var scale = MAX_WIDTH / (shouldWidth + 20);
	if (ROW_HEIGHT * 3 * scale > MAX_HEIGHT) {
		scale = MAX_HEIGHT / (ROW_HEIGHT * 3);
	}
	sitesElement.style.webkitTransform = "scale(" + scale + ", " + scale + ")";
	sitesElement.style.marginLeft = -shouldWidth / 2 + "px";
}

function createSite(abbreviation, url) {
	var site = document.createElement('a');

	site.innerHTML = abbreviation + '<span class="url">' + getHostname(url) + '</span>';

	return site;
}