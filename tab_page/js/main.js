document.addEventListener('DOMContentLoaded', function() {
	document.removeEventListener('DOMContentLoaded', arguments.callee, false);
	init();
}, false );

function init() {
	var siteDiv = document.getElementById('sites');
	var siteList = siteDiv.getElementsByTagName('ul')[0];

	chrome.storage.sync.get('sites', function(items) {
		sites = items['sites'];

		if (sites.length == 0) {
			alert("Oh noez!");
		}

		for (var i = 0; i < sites.length; i++) {
			(function() {
				var site = sites[i];

				var li = createSite(site.abbreviation, site.url);

				var color = site.color;

				if (color) {
					li.style.background = 'rgba(' + color.red +', ' + color.green + ', ' + color.blue + ', ' + 1 +')';
					console.log(site.url, li.style.color);
				}

				li.onclick = function() {
					var options = {
						url: site.url,
						active: true
					}

					chrome.tabs.update(options);
				}
8
				siteList.appendChild(li);
			})();
		}
	});

	
}

function createSite(abbreviation, url) {
	var site = document.createElement('li');

	site.innerHTML = abbreviation + '<span class="url">' + hostname(url) + '</span>';

	return site;
}

function hostname(url) {
	var domainRegex = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/igm;
	var a = domainRegex.exec(url);
	domainRegex.lastIndex = 0;

	var hostname = a[4];

	if (hostname.substring(0, 4) == "www.") {
		hostname = hostname.substring(4);
	}

	return hostname;
}