export default {
	'ajax': {
		'post': function (form_data, callback, timeout = 20000) {
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
	/**
	 * Get an element's distance from the top of the document
	 *  - Iterates through all elements above the DOM to get an accurate value in px
	 *
	 * @param containerDom          The container to measure
	 * @returns {number}            The distance from top
	 */
	/**
	 * Returns the coordinates (in px) of the user's mouse on the screen relative to the container they are closest to
	 *
	 * @param containerDom                          The DOM of the container
	 * @param e                                     JavaScript event data
	 * @returns {{top: number, left: number}}
	 */
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



		// For reference/testing
		// console.log("Container Top: " + coordinates.container.top + " | Left: " + coordinates.container.left +
		//     "\nDocument Top: " + coordinates.doc.top + " | Left: " + coordinates.doc.left +
		//     "\nClient Top: " + coordinates.client.top + " | Left: " + coordinates.client.left +
		//     "\nWindow Top: " + coordinates.window.top + " | Left: " + coordinates.window.left +
		//     "\nComputed Top: " + coordinates.computed.top + " | Left: " + coordinates.computed.left);

		return coordinates;
	}
};