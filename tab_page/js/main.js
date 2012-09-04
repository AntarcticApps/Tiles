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
			var site = sites[i];

			var li = createSite(site.abbreviation, site.url);

			var color = site.color;

			if (color) {
				li.style.color = 'rgba(' + color.red +', ' + color.green + ', ' + color.blue + ', ' + color.alpha +')';
				console.log(site.url, li.style.color);
			}

			li.onclick = function() {
				var options = {
					url: site.url,
					active: true
				}

				chrome.tabs.update(options);
			}

			siteList.appendChild(li);
		}
	});
}

function createSite(abbreviation, url) {
	var site = document.createElement('li');

	site.innerHTML = abbreviation;

	return site;
}