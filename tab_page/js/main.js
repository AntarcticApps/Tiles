var sites;

document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {	
	var sitesElement = document.getElementById('sites');

	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		document.addEventListener("DOMNodeInserted", layout, false);

		if (sites == undefined || sites == null || sites.length == 0) {
			showNoSitesMessage();
			return;
		}

		var fragment = document.createDocumentFragment();
		for (var i = 0; i < sites.length; i++) {
			var site = sites[i];
			var tile = createTile(site.abbreviation, site.url);
			var color = site.color;
			tile.style.background = 'rgba(' + color.red +', ' + color.green + ', ' + color.blue + ', ' + 1 +')';
			tile.dataset.url = site.url;
			tile.onclick = onTileClick;

			fragment.appendChild(tile);
		}
		sitesElement.appendChild(fragment);
	});

	window.onresize = function() {
		layout();
	};

	chrome.contextMenus.removeAll(function() {
		chrome.contextMenus.create({
		    "title": "Tiles Options",
		    "documentUrlPatterns": [window.location.origin + "/*"],
		    "contexts": ["page", "link"],
		    "onclick" : function() {
		    	goToOptionsPage(true)
		    }
		});
	});
}

function goToOptionsPage(newTab) {
	var optionsURL = "options/options.html"

	if (newTab) {
		chrome.tabs.create({
			url: optionsURL
		});
	} else {
		chrome.tabs.getCurrent(function(tab) {
			chrome.tabs.update(tab.id, { url : optionsURL })
		});
	}
}

function layout() {
	if (sites == undefined || sites == null) {
		return;
	}

	document.removeEventListener("DOMNodeInserted", layout);
	
	var sitesElement = document.getElementById("sites");

	sitesElement.style.opacity = "1.0";

	const MARGIN = 8;
	const ROW_HEIGHT = 220 + MARGIN;
	const COL_WIDTH = 220 + MARGIN;
	const MAX_HEIGHT = window.innerHeight - MARGIN;
	const MAX_WIDTH = window.innerWidth - MARGIN;

	var rows = Math.min(3, sites.length);
	if (sites.length == 3 || sites.length == 4)
			rows = 2;

	var cols = Math.ceil(sites.length / rows);
	var shouldWidth = cols * COL_WIDTH;
	sitesElement.style.width = shouldWidth + "px";

	var scale = MAX_WIDTH / (shouldWidth + 20);
	if (ROW_HEIGHT * rows * scale > MAX_HEIGHT) {
		scale = MAX_HEIGHT / (ROW_HEIGHT * rows);
	}
	sitesElement.style.webkitTransform = "scale(" + scale + ", " + scale + ")";
	sitesElement.style.marginLeft = -shouldWidth / 2 + "px";

	sitesElement.style.minHeight = 228 * rows + "px";
	sitesElement.style.marginTop = (-228 * rows) / 2 + "px";
}

function createTile(abbreviation, url) {
	var site = document.createElement('a');
	site.setAttribute("class", "tile");
	site.innerHTML = abbreviation + '<span class="url">' + getHostname(url) + '</span>';
	return site;
}

function onTileClick(e) {
	var target = e.target;
	var url = target.dataset.url;

	if (e.metaKey == false) {
		var sitesElement = document.getElementById("sites");

		target.setAttribute("class", "tile animate");
		var sitesTransform = sitesElement.style.webkitTransform;
		var floatRegex = /scale\(([0-9]*\.?[0-9]*), ?([0-9]*\.?[0-9]*)\)/;
		var sitesScale = floatRegex.exec(sitesTransform)[1];

		const ROW_HEIGHT = 220;
		const COL_WIDTH = 220;
		const ROW_OUTER_HEIGHT = 228;
		const COL_OUTER_WIDTH = 228;
		const CHANGE_LOCATION_DELAY = 300;

		var rows = Math.min(3, sites.length);
		if (sites.length == 3 || sites.length == 4)
			rows = 2;

		var scaleX = window.innerWidth / sitesScale / COL_WIDTH;
		var scaleY = window.innerHeight / sitesScale / ROW_HEIGHT;

		var sitesMidX = parseInt(sitesElement.style.width) / 2;
		var sitesMidY = ROW_OUTER_HEIGHT * rows / 2;

		var centerX = target.offsetLeft + COL_WIDTH / 2;
		var centerY = target.offsetTop + ROW_HEIGHT / 2;

		var translateX = sitesMidX - centerX;
		var translateY = sitesMidY - centerY;
		target.style.webkitTransform = "translate(" + translateX + "px, " + translateY + "px) scale(" + scaleX + ", " + scaleY + ")";
		target.style.background = "white";

		setTimeout(function() {
			window.location = url;
		}, CHANGE_LOCATION_DELAY);
	} else {
		chrome.tabs.create({ 'url': url, active: false });
	}
}

function showNoSitesMessage() {
	var siteElement = document.getElementById('sites');

	var tile = document.createElement('div');
	tile.setAttribute("class", "message");
	tile.innerHTML = "<span>No Tiles Added</span>";

	document.getElementsByTagName('body')[0].appendChild(tile);
}
