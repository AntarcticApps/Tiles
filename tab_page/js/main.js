var sites;

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

				siteList.appendChild(li);
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

function createSite(abbreviation, url) {
	var site = document.createElement('li');

	site.innerHTML = abbreviation + '<span class="url">' + getHostname(url) + '</span>';

	return site;
}