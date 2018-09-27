export default {
	'ajax': {
		'post': function (form_data, callback, timeout = 60000) {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", '/wikimap/src/scripts/wikilinks.php');
			xhr.responseType = 'text';
			xhr.timeout = timeout;
			/* If an error occurs */
			xhr.onerror = function () {
				console.log("AJAX Error");
			};
			/* When the request is loading */
			xhr.onprogress = function () {
				console.log("AJAX Loading");
			};
			/* If the request timed out */
			xhr.ontimeout = function () {
				console.log("Ajax timed out");
			};
			/* When the request is completed */
			xhr.onload = function () {
				if (xhr.readyState === 4) {           // If the request is completed
					console.log("Ajax Finished");
					callback(xhr.responseText);
				}
				else {
					console.log("AJAX Error - don't know what");
				}
			};
			xhr.send(form_data);
		},
		'sphinx': function (form_data, callback, timeout = 20000) {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", '/wikimap/sphinx/wiki_sphinx.php');
			xhr.responseType = 'text';
			xhr.timeout = timeout;

			/* If an error occurs */
			xhr.onerror = function () {
				console.log("AJAX Error");
			};
			/* When the request is loading */
			xhr.onprogress = function () {
				console.log("AJAX Loading");
			};
			/* If the request timed out */
			xhr.ontimeout = function () {
				console.log("Ajax timed out");
			};
			/* When the request is completed */
			xhr.onload = function () {
				if (xhr.readyState === 4) {           // If the request is completed
					console.log("Ajax Finished");
					callback(xhr.responseText);
				}
				else {
					console.log("AJAX Error - don't know what");
				}
			};
			xhr.send(form_data);
		}
	},
	'id': {
		// Add a class to the specified ID
		// @param id 			The HTML tag ID
		// @param className  	The class to add
		'addClass': function(id, className){
			this.getDom(id).classList.add(className);
		},
		// Get the DOM of an element with the specified ID
		// @param id                        The HTML tag ID to search for
		// @returns {HTMLElement | null}    The element's DOM
		'getDom': function (id) {
			return document.getElementById(id);
		},
		// * Hide an element from the screen
		// * @param id			The HTML tag ID
		'hide': function(id){
			this.getDom(id).classList.add('hide');                               // Add the 'hide' class
		},
		// * Remove a class from the specified ID
		// * @param id            The HTML tag ID to search for
		// * @param className     The class to remove
		'removeClass': function(id, className){
			this.getDom(id).classList.remove(className);
		},
		// * Show an element (if it was previously hidden)
		// * @param id        The specified HTML tag ID
		'show': function(id){
			this.getDom(id).classList.remove('hide');                            // Remove the 'hide' class
		},
		// Update the HTML inside the element
		// @param id                The HTML tag ID of the element
		// @param htmlCode          The code to replace existing HTML with
		'updateHtml': function(id, htmlCode){                           /* Replace the HTML inside the matching element */
			var target_container = this.getDom(id);
			target_container.innerHTML = htmlCode;
		}
	},
	'dom':{
		/**
		 * Return the DOM of the element matched within the parent (equivalent of jQuery find)
		 *
		 * @param parentDom         The element DOM to start with
		 * @param selector          The class/tag/ID to find
		 * @returns {*}
		 */
		'findBySelector': function (parentDom, selector) {
			return parentDom.querySelector(selector);
		},
	},
	'getMouseCoordinates': function (containerDom, e) {
		let client = containerDom.getBoundingClientRect();

		let xPosition = 0;
		let yPosition = 0;

		let coordinates = {
			'container': {
				'top': containerDom.offsetTop,                  // The distance of the nearest container from the top of the page in px
				'left': containerDom.offsetLeft,                // The distance of the nearest container from the left of the page in px
			},
			'doc': {
				'top': e.pageY,                                 // The distance of the user's cursor from the top of the page in px
				'left': e.pageX                                 // The distance of the user's cursor from the left of the page in px
			},
			'client': {
				'top': client.top,
				'left': client.left,
			},
			'window': {
				'top': window.pageYOffset,
				'left': window.pageXOffset,
			},
			'computed':{
				'top': yPosition,
				'left': xPosition,
			}
		};


		// Loop through the parent nodes until you reach the top of the page (since the offset top will stop a parents with position relative/absolute)
		while(containerDom){
			xPosition += (containerDom.offsetLeft - containerDom.scrollLeft + containerDom.clientLeft);
			yPosition += (containerDom.offsetTop - containerDom.scrollTop + containerDom.clientTop);
			containerDom = containerDom.offsetParent;
		}

		coordinates.computed.top = yPosition;
		coordinates.computed.left = xPosition;

		return coordinates;
	},
	'colorScale': function (minVal, maxVal, val) {
		let percent = (maxVal !== minVal) ? val/(maxVal-minVal): 1
		let rgbMin, rgbMax, R, G, B;
		If (percent > 0)
		{
			if (percent <= 0.5) {
				rgbMin = Array(255, 0, 0);
				rgbMax = Array(255, 100, 0);
				percent = percent / 0.5;
			} else {
				rgbMin = Array(255, 255, 0);
				rgbMax = Array(0, 153, 0);
				percent = (percent - 0.5) / 0.5;
			}
			R = rgbMin[0] + (rgbMax[0] - rgbMin[0]) * percent;
			G = rgbMin[1] + (rgbMax[1] - rgbMin[1]) * percent;
			B = rgbMin[2] + (rgbMax[2] - rgbMin[2]) * percent;

			return rgb(R, G, B);
		}
	}
};