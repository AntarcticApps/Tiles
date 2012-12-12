var displayListener = new Listener();

window.onload = function() {
	document.write('<canvas width="512" height="512" style="display: none"></canvas>');
	
	relay();
};

displayListener.onEnter = function(part) {
	if (part instanceof Describe || part instanceof It) {
		var prefix = "";
		if (part instanceof Describe) {
			prefix = "describe";
		} else if (part instanceof It) {
			prefix = "it";
		}

		document.write("<li id=" + prefix + "-" + part.id + ">" + part.toString() + "</li>");
		document.write("<ul>");
	}
}

displayListener.onExit = function(part) {
	if (part instanceof Expect) {
		var prefix = "";
		var relevantParent = part.parent;

		while (!(relevantParent instanceof Describe) && !(relevantParent instanceof It)) {
			relevantParent = relevantParent.parent;
		}

		if (relevantParent instanceof Describe) {
			prefix = "describe";
		} else if (relevantParent instanceof It) {
			prefix = "it";
		}

		var alreadyFailed = document.getElementById(prefix + "-" + relevantParent.id).dataset['failed'];
		if (part.success && !alreadyFailed) {
			document.getElementById(prefix + "-" + relevantParent.id).style.color = "green";
		} else {
			document.getElementById(prefix + "-" + relevantParent.id).style.color = "red";
			document.getElementById(prefix + "-" + relevantParent.id).dataset['failed'] = true;
			
			document.write("<strong>Expected " + JSON.stringify(part.value) + " to " + part.type + " " + JSON.stringify(part.other) + "</strong><br>");

			for (var i = 0; i < part.callStack.length; i++) {
				document.write(part.callStack[i]);
				document.write("<br>");
			}
		}
	}

	if (part instanceof Describe || part instanceof It) {
		document.write("</ul>");
	}
}

addListener(displayListener);