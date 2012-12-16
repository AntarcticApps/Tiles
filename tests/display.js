"use strict";

window.onload = function() {
	relay().start();
};

var displayListener = new RelayListener();
var timesEntered = {};
var intervals = {};

displayListener.onRelayStart = function() {
	var parentElement = document.getElementById("relay_results");
	
	var doneMessage = document.createElement("p");
	doneMessage.innerHTML = "Relay started.";
	parentElement.appendChild(doneMessage);

	var rootList = document.createElement("ol");
	parentElement.appendChild(rootList);
};

displayListener.onRelayEnd = function() {
	var parentElement = document.getElementById("relay_results");
	
	var doneMessage = document.createElement("p");
	doneMessage.innerHTML = "Relay ended.";
	parentElement.appendChild(doneMessage);
};

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
		
		timesEntered[relayObject.id] = new Date();

		var timeSpan = document.createElement("span");
		timeSpan.setAttribute("class", "duration");
		listItem.appendChild(timeSpan);

		intervals[relayObject.id] = window.setInterval(function() {
			timeSpan.innerHTML = timeDifference(timesEntered[relayObject.id], new Date());
		}, 100);

		var innerList = document.createElement("ol");
		listItem.appendChild(innerList);
	}
};

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
	} else if (relayObject.constructor == Describe || relayObject.constructor == It) {
		var element = document.getElementById(relayObject.id);

		clearInterval(intervals[relayObject.id]);
		element.getElementsByClassName("duration")[0].innerHTML = timeDifference(timesEntered[relayObject.id], new Date());
	}
};

function timeDifference(earlier, later) {
	var difference = later.getTime() - earlier.getTime();
	var days = Math.floor(difference / 1000 / 60 / 60 / 24);
	difference -= days * 1000 * 60 * 60 * 24;
	var hours = Math.floor(difference / 1000 / 60 / 60);
	difference -= hours * 1000 * 60 * 60;
	var minutes = Math.floor(difference / 1000 / 60);
	difference -= minutes * 1000 * 60;
	var seconds = Math.floor(difference / 1000);
	difference -= seconds * 1000;
	var milliseconds = difference;

	var str = "";
	if (days > 0){
		str += days + " day" + (days > 1 ? "s" : "") + ", ";
	}

	if (minutes > 0){
		str += minutes + " minute" + (minutes > 1 ? "s" : "") + ", ";
	}

	if (seconds > 0) {
		str += seconds + " second" + (seconds > 1 ? "s" : "") + ", ";
	}

	if (milliseconds > 0) {
		str += milliseconds + " millisecond" + (milliseconds > 1 ? "s" : "");
	}

	if (str == "") {
		str += "0 milliseconds";
	}

	return str;
}

addRelayListener(displayListener);