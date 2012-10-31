document.addEventListener('DOMContentLoaded', function() {
	var links = document.getElementsByTagName('a');
	for (var i in links) {
		(function(link) {
			link.onclick = function(e) {
				e.preventDefault();
				
				chrome.extension.sendMessage({ message: "openTab", url: link.href }, function(response) {
					window.close();
				});
			}
		})(links[i]);
	}

	_gaq.push(['_trackPageview']);
});