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
				
				link.setAttribute("href", site.url);

				siteDiv.appendChild(link);
			})();
		}
	});

	document.onkeypress = function(e) {
		var character = String.fromCharCode(e.charCode);
		var value = parseInt(character);
		if (value != NaN) {
			document.location = sites[value].url;
		}
	}

	var optionsLink = document.createElement("a");
	optionsLink.setAttribute("class", "settings btn");
	optionsLink.onclick = function() {
		chrome.tabs.create({
			url: "options/options.html"
		});
	}

	optionsLink.innerHTML = "Options";
	document.body.appendChild(optionsLink);
}

function layout() {
	document.removeEventListener("DOMNodeInserted", layout);
	
	var cols = Math.ceil(sites.length / 3);
	var shouldWidth = cols * 220;
	shouldWidth += (cols - 2) * 4;
	document.getElementById("sites").style.width = shouldWidth + "px";
}

function createSite(abbreviation, url) {
	var site = document.createElement('a');

	site.innerHTML = abbreviation + '<span class="url">' + getHostname(url) + '</span>';

	return site;
}