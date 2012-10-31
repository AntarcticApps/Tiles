var sites;

document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );


chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('Message received: ' + request.message);

	if (request.message == "refresh") {
		location.reload();
	}
});

function init() {
	resetStorageToDefault();
	
	var sitesElement = document.getElementById('sites');
	
	getAllSites(function(items) {
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

	var rows = Math.max(Math.ceil(Math.sqrt(sites.length * MAX_HEIGHT / MAX_WIDTH)), 1);
	var cols = Math.ceil(sites.length / rows);
	if ((rows - 1) * cols >= sites.length && sites.length < rows * cols) {
		rows--;
	}

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
	site.setAttribute("href", url);
	site.innerHTML = abbreviation + '<span class="url">' + getHostname(url) + '</span>';
	return site;
}

function isMac() {
	if (navigator.appVersion.toLowerCase().indexOf("mac") != -1)
		return true;

	return false;
}

function onTileClick(e) {
	e.preventDefault();

	var target = e.target;

	// correct target if element clicked was actually the url span
	if (target.getAttribute("class") == "url") {
		target = target.parentNode;
	}

	var sitesElement = document.getElementById("sites");
	var url = target.href;

	if (url == null || url == "") {
		return false;
	}

	var newTab = false;
	var newWindow = false;
	var activeWhenOpened = false;
	if (isMac()) {
		if (e.metaKey || e.button == 1) {
			newTab = true;
			if (e.shiftKey) {
				activeWhenOpened = true;
			}
		} else if (e.shiftKey) {
			newWindow = true;
			activeWhenOpened = true;
		}
	} else {
		if (e.ctrlKey || e.button == 1) {
			newTab = true;
			if (e.shiftKey) {
				activeWhenOpened = true;
			}
		} else if (e.shiftKey) {
			newWindow = true;
			activeWhenOpened = true;
		}
	}

	if (newTab) {
		chrome.tabs.create({ 'url': url, 'active': activeWhenOpened });
	} else if (newWindow) {
		chrome.windows.create({ 'url': url, 'focused': activeWhenOpened, 'type': 'normal' });
	} else {
		target.setAttribute("class", "tile animate");
		var sitesTransform = sitesElement.style.webkitTransform;
		var floatRegex = /scale\(([0-9]*\.?[0-9]*), ?([0-9]*\.?[0-9]*)\)/;
		var sitesScale = floatRegex.exec(sitesTransform)[1];

		const MARGIN = 8;
		const ROW_HEIGHT = 220;
		const COL_WIDTH = 220;
		const ROW_OUTER_HEIGHT = 228;
		const COL_OUTER_WIDTH = 228;
		const CHANGE_LOCATION_DELAY = 300;
		const MAX_HEIGHT = window.innerHeight - MARGIN;
		const MAX_WIDTH = window.innerWidth - MARGIN;

		var rows = Math.max(Math.ceil(Math.sqrt(sites.length * MAX_HEIGHT / MAX_WIDTH)), 1);
		var cols = Math.ceil(sites.length / rows);
		if ((rows - 1) * cols >= sites.length && sites.length < rows * cols) {
			rows--;
		}
		
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
			document.body.style.visibility = "hidden";
		}, CHANGE_LOCATION_DELAY);

		setTimeout(function() {
			window.location = url;
		}, CHANGE_LOCATION_DELAY);
	}
}

function showNoSitesMessage() {
	var siteElement = document.getElementById('sites');

	var message = document.createElement('div');
	message.setAttribute("class", "message");
	message.innerHTML = "<p>" + chrome.i18n.getMessage("no_tiles_added")
	 + "<span class='help'>" + chrome.i18n.getMessage("tab_page_no_tiles_added_help", ["<img src='/TILES_VERSION_ID_/icons/icon-bitty-gray.png'>"]) + "</span>"
	 + "</p>";

	document.getElementsByTagName('body')[0].appendChild(message);
}
