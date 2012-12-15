"use strict";

window.onload = function() {
	relay().start();
};

var displayListener = new RelayListener();

displayListener.onRelayStart = function() {
	var parentElement = document.getElementById("relay_results");
	
	var doneMessage = document.createElement("p");
	doneMessage.innerHTML = "Relay started.";
	parentElement.appendChild(doneMessage);

	var rootList = document.createElement("ol");
	parentElement.appendChild(rootList);
}

displayListener.onRelayEnd = function() {
	var parentElement = document.getElementById("relay_results");
	
	var doneMessage = document.createElement("p");
	doneMessage.innerHTML = "Relay ended.";
	parentElement.appendChild(doneMessage);
}

displayListener.onEnter = function(relayObject) {
	if (relayObject.constructor == Describe || relayObject.constructor == It) {
		var relevantParent = relayObject.findFirstParent(function(ancestor) {
			return (ancestor.constructor == Describe) || (ancestor.constructor == It);
		});

		var parentElement = document.getElementById(relevantParent.id);		
		if (!parentElement) {
			parentElement = document.getElementById("relay_results");
		}

		var parentList = parentElement.getElementsByTagName("ol")[0];

		var listItem = document.createElement("li");
		listItem.setAttribute("id", relayObject.id);
		listItem.setAttribute("class", relayObject.typeString());
		listItem.innerHTML = relayObject.name;
		parentList.appendChild(listItem);
		
		var innerList = document.createElement("ol")
		listItem.appendChild(innerList);
	}
}

displayListener.onExit = function(relayObject) {
	if (relayObject.constructor == Expect) {
		var relevantParent = relayObject.findFirstParent(function(ancestor) {
			return (ancestor.constructor == Describe) || (ancestor.constructor == It);
		});

		var parentElement = document.getElementById(relevantParent.id);
		var alreadyFailed = parentElement.getAttribute("class") == "failed";

		if (relayObject.success && !alreadyFailed) {
			parentElement.setAttribute("class", "succeeded");
		}

		if (!relayObject.success && !alreadyFailed) {
			parentElement.setAttribute("class", "failed");
		}

		if (!relayObject.success) {
			var parentList = parentElement.getElementsByTagName("ol")[0];

			var failureReason = document.createElement("p");
			failureReason.setAttribute("class", "reason");
			failureReason.innerHTML = relayObject.resultString();
			if (relayObject.caller) {
				failureReason.innerHTML += " on " + relayObject.caller;
			}
			parentList.appendChild(failureReason);
		}
	}
}

addRelayListener(displayListener);