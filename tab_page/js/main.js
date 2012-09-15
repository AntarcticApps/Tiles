var sites;

document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );


chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('Message received: ' + request.message);

	if (request.message == "saved") {
		location.reload();
	}
});

function init() {	
	var sitesElement = document.getElementById('sites');
	
	getSites(function(items) {
		sites = items;
		document.addEventListener("DOMNodeInserted", layout, false);

		if (sites == undefined || sites == null || sites.length == 0) {
			showNoSitesMessage();
			return;
		}

		var fragment = document.createDocumentFragment();
		for (var i = 0; i < sites.length; i++) {
			var site = sites[i];
			var tile = createTile(site.abbreviation, site.url);
			var color;
			if (site.customColor) {
				color = site.customColor;
			} else {
				color = site.color;
			}
			tile.style.background = 'rgba(' + color.red +', ' + color.green + ', ' + color.blue + ', ' + 1 +')';
			tile.onclick = onTileClick;

			fragment.appendChild(tile);
		}
		sitesElement.appendChild(fragment);
	});

	window.onresize = function() {
		layout();
	};
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
	var sitesElement = document.getElementById("sites");
	var url;

	for (var i = 0; i < sitesElement.children.length; i++) {
		if (target == sitesElement.children[i]) {
			url = sites[i].url;
			break;
		}
	}

	if (url == null || url == "") {
		return false;
	}

	if (e.metaKey == false) {
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
	tile.innerHTML = "<p>" + chrome.i18n.getMessage("tab_page_no_tiles_added")
	 + "<span class='help'>" + chrome.i18n.getMessage("tab_page_no_tiles_added_help", ["<img src='../../icons/icon-bitty-gray.png'>"]) + "</span>";
	 + "</p>";

	document.getElementsByTagName('body')[0].appendChild(tile);
}
