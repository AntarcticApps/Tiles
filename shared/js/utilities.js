function domainRegex(url) {
	var domainRegex = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/igm;
	var result = domainRegex.exec(url);

	return result;
}

function getDomain(url) {
	return /^((([^:\/?#]+):)?(\/\/([^\/?#]*))?)/igm.exec(url)[0];
}

function getHostname(url) {
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
		finishCallback();
	}
}