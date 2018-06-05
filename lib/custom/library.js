

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
	}
};