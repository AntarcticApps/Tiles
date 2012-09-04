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