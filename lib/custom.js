// /lib/custom.js
import v from  './globals.js';
/* JS Library for common functions */

const l = {
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
        }
    },
    'id': {
        /**
         * Add a class to the specified ID
         *
         * @param id            The HTML tag ID
         * @param className     The class to add
         */
        'addClass': function(id, className){
            this.getDom(id).classList.add(className);
        },

        /**
         * Get the DOM of an element with the specified ID
         *
         * @param id                        The HTML tag ID to search for
         * @returns {HTMLElement | null}    The element's DOM
         */
        'getDom': function (id) {
            return document.getElementById(id);
        },

        /**
         * Hide an element from the screen
         *
         * @param id    The HTML tag ID
         */
        'hide': function(id){
            this.getDom(id).classList.add('hide');                               // Add the 'hide' class
        },

        /**
         * Remove a class from the specified ID
         *
         * @param id            The HTML tag ID to search for
         * @param className     The class to remove
         */
        'removeClass': function(id, className){
            this.getDom(id).classList.remove(className);
        },

        /**
         * Show an element (if it was previously hidden)
         *
         * @param id        The specified HTML tag ID
         */
        'show': function(id){
            this.getDom(id).classList.remove('hide');                            // Remove the 'hide' class
        },

        /**
         * Update the HTML inside the element
         *
         * @param id                The HTML tag ID of the element
         * @param htmlCode          The code to replace existing HTML with
         */
        'updateHtml': function(id, htmlCode){                           /* Replace the HTML inside the matching element */
            var target_container = this.getDom(id);
            target_container.innerHTML = htmlCode;
        }
    }
};
// /* Handle device orientaion (think 360 photo) */
// function onDeviceOrientationChangeEvent( event ) {
// 	window.deviceOrientation = event;
// }
// /* Handle screen rotations */
// function onScreenOrientationChangeEvent( event ) {
// 	window.screenOrientation = window.orientation || 0;
// }
/* Event Listeners */

function events() {
	// var slider = document.getElementById("myRange");
	// var output = document.getElementById("demo");
	// output.innerHTML = slider.value; // Display the default slider value

	// Update the current slider value (each time you drag the slider handle)
	// slider.oninput = function(){
	// 	console.log(this.value);
	// }
    window.addEventListener('click', wikiEvents);
    window.addEventListener('submit', wikiEvents);
	window.addEventListener('pointerdown', wikiEvents);
	window.addEventListener('pointermove', wikiEvents);
	window.addEventListener('mousewheel', wikiEvents);

	// window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );	// When screen rotates
	// window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );	// Device orientation

}

function wikiEvents(e) {
		var data = {
			'type': e.type,
			'key': e.key,
			'dom': {
				'div': e.target.closest('div'),
				'form': e.target.closest('form'),
				'input': e.target.closest('input')
			}
		}

		/* Submit Events */
		if (e.type == 'submit') {
			e.preventDefault();									// Prevent PHP from processing the form
			var userInput = l.id.getDom('user_input').value;	// Get the user's search text
			if (!v.local_data) {
				databaseRequest(userInput);							// Call the database function
			} else {
				offlineRequest();
			}
			v.isRotating = true;
		}
		else if (e.type == 'pointerdown') {
			v.freeze_graph = false;
			v.isRotating = true;
			v.animate();
		}
		else if (e.type == ('pointermove' || 'mousewheel') && !v.isRotating) {
			v.freeze_graph = true;
			v.animate();
		}
		/* Click Events */
		else if (e.type == 'click') {
			// If the user clicks on a DIV
			v.isRotating = false;
			if(data.dom.div){
				// v.freeze_graph = true;
				var div = data.dom.div;
				if(div.id == '3d-graph'){                       // If the user clicks on the 3d-graph
					l.id.hide('wikipedia_preview');             // Hide the wikipedia preview
					l.id.removeClass('wikipedia_preview', 'show');
					clearInterval(intervalObj);
					v.nav_info.hidden = true;
					v.freeze_graph = true;
				}
			}
		}
}
function offlineRequest() {
	var parsedData = JSON.parse(v.default_json);
	// let executionTime = parsedData.execution_time;
	v.max_shared_links = parsedData.max_shared_links;
	v.min_shared_links = parsedData.min_shared_links;
	showGraph(parsedData.results);	// Load the graph
}
function databaseRequest(userInput) {
    var form_data = new FormData();
    form_data.append('user_input', userInput);
    form_data.append('server_class', 'fetchMultiData');         // Specify the PHP class to call
    l.ajax.post(form_data, function (data) {
		var parsedData = JSON.parse(data);
        v.max_shared_links = parsedData.max_shared_links;
        v.min_shared_links = parsedData.min_shared_links;
        showGraph(parsedData.results);	// Load the graph
    });
}
/**
 * Shows the graph data
 * @param jsonResponse
 */
const orbit_distance = 300;
var Graph = void 0;
function showGraph(jsonResponse) {
	v.freeze_graph = false;
	const elem = document.getElementById('3d-graph');
	Graph = ForceGraph3D()(elem)
		.linkOpacity(1)
		.linkWidth(1)
		.nodeOpacity(1)
		.nodeRelSize(4)
		.cameraPosition({z: orbit_distance})
		.onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)	// hover cursor a selecting hand
		.onNodeClick(colorNode)
		.graphData(jsonResponse);
	orbit_camera();
}

var intervalObj = void 0;
// Auto orbit the camera
function orbit_camera() {
	if (Graph){
		if (v.auto_orbit) {
			var angle = 0;
			intervalObj = setInterval(function () {
				Graph.cameraPosition({
					x: orbit_distance * Math.sin(angle),
					y: 100,
					z: orbit_distance * Math.cos(angle)
				});
				angle += Math.PI / 300;
			}, 10);
		}
	}
}
// orbit_camera(); // begin orbit.  Could use an IIFE

function colorNode(node) {
	clearInterval(intervalObj);
	const { nodes, links } = Graph.graphData();
	colorOthers(nodes);
	show_wiki(node);
	node.color = '#ff00ff';	// highlight selected node
	node.visited = !node.visited;
	colorLinks(links);
	Graph.graphData({nodes,links})
	Graph.cooldownTicks(0);
	Graph.cameraPosition({ x: node.x + 40, y: node.y + 40, z: node.z + 40 }, node);	// center camera on node 40 units away
}
// needed for heat map
function distance_from_center(node){
	var center_node = Graph.graphData().nodes[0];
	var vector_distance = Math.sqrt((node.x - center_node.x)^2 + (node.y - center_node.y)^2 + (node.z - center_node.z)^2);
	// console.log(node.name + ' distance: ' + vector_distance);
}

function show_wiki(node){
	// Define the Wikipedia page preview
	if (!node) {                                                // If there is no node selected/clicked
		l.id.hide('wikipedia_preview');                         // Hide the wikipedia preview
		l.id.removeClass('wikipedia_preview', 'show');
	} else {
		l.id.show('wikipedia_preview');                             // Show the wikipedia container
		l.id.addClass('wikipedia_preview', 'show');
		l.id.updateHtml('wikipedia_preview', "<iframe src='https://en.m.wikipedia.org/wiki/" + node.name + "'><iframe>");
	}
}

/* color all nodes but the current one (must come before visited node coloring) */
function colorOthers (nodes) {
	nodes.forEach(function (node) {
		distance_from_center(node);
		if (node.visited) {
			node.color = '#00ff00';	// visted nodes green
		} else {
			node.color = '#0000ff';	// revert back to blue if deselected
		}});
	nodes[0].color = '#ffffff';		// make t0 node white
}
/* colors links between visited nodes a color else a default color */
function colorLinks (links) {
	links.forEach(function (link) {
		if (link.source.visited && link.target.visited){
			link.color = '#00ff00';	// visted links green
		} else {
			link.color = '#00ffff';
		}
	});
}


function wikimap() {
    events();                           // Start all of the event listeners
}

export default wikimap;