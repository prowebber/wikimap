// /lib/custom.js
import v from  './globals.js';
import SpriteText from 'three-spritetext';
// import {addLabels} from './app.js';
/* JS Library for common functions */
const l = {
    'ajax': {
        'post': function (form_data, callback, timeout = 5000) {
            let xhr = new XMLHttpRequest();
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
            let target_container = this.getDom(id);
            target_container.innerHTML = htmlCode;
        }
    }
};

/* Event Listeners */
function events() {
    window.addEventListener('click', wikiEvents);                // Whenever someone submits a form
    window.addEventListener('submit', wikiEvents);                // Whenever someone submits a form
}

function wikiEvents(e) {
		let data = {
			'type': e.type,
			'key': e.key,
			'dom': {
				'div': e.target.closest('div'),
				'form': e.target.closest('form'),
				'input': e.target.closest('input')
			}
		};

		/* Submit Events */
		if (e.type == 'submit') {
			e.preventDefault();									// Prevent PHP from processing the form

			let userInput = l.id.getDom('user_input').value;	// Get the user's search text
			if (!v.local_data) {
				databaseRequest(userInput);							// Call the database function
			} else {
				offlineRequest();
			}
		}

		/* Click Events */
		else if (e.type == 'click') {

			// If the user clicks on a DIV
			if(data.dom.div){
				let div = data.dom.div;

				if(div.id == '3d-graph'){                       // If the user clicks on the 3d-graph
					l.id.hide('wikipedia_preview');             // Hide the wikipedia preview
					l.id.removeClass('wikipedia_preview', 'show');
				}
			}
		}	else{
			let parsedData = JSON.parse(v.default_json);

			/* Get the data from the request */
			let matchedPageId = parsedData.target_page_id;
			let matchedPageTitle = parsedData.target_page_title;
			let jsonResponse = parsedData.results;
			let executionTime = parsedData.execution_time;
			v.max_shared_links = parsedData.max_shared_links;
			v.min_shared_links = parsedData.min_shared_links;
			showGraph(jsonResponse);
		}

}
function offlineRequest() {
	v.freeze_graph = false;
	/* use default data stored in global */
	let parsedData = JSON.parse(v.default_json);
	/* Load the graphic */
	showGraph(parsedData);
}
function databaseRequest(userInput) {
    v.freeze_graph = false;
    let form_data = new FormData();
    form_data.append('user_input', userInput);
    form_data.append('server_class', 'fetchMultiData');         // Specify the PHP class to call

    l.ajax.post(form_data, function (data) {
        let parsedData = JSON.parse(data);

        /* Get the data from the request */
        let matchedPageId = parsedData.target_page_id;
        let matchedPageTitle = parsedData.target_page_title;
        let jsonResponse = parsedData.results;
        let executionTime = parsedData.execution_time;
        v.max_shared_links = parsedData.max_shared_links;
        v.min_shared_links = parsedData.min_shared_links;

        // Output data to the console for debugging
        console.log('JSON:\n' + jsonResponse);
        console.log('Matched Page ID: ' + matchedPageId);
        console.log('Matched Page Title: ' + matchedPageTitle);
        console.log('Execution Times:\n' + executionTime);
        console.log('Converted Node:\n' + parsedData.converted_node);

        /* Load the graphic */
        showGraph(jsonResponse);
    });
}

/**
 * Shows the graph data
 *
 * @param jsonResponse
 */
// import 'three-forcegraph';
function showGraph(jsonResponse) {
    const Graph = ForceGraph3D()
    (document.getElementById('3d-graph'))
        .graphData(jsonResponse)
        .onNodeClick(colorNode);


    function colorNode(node) {
        v.freeze_graph = true;
        v.clicked_node_x = node.x;
        v.clicked_node_y = node.y;
        v.clicked_node_z = node.z;

        let {nodes, links} = Graph.graphData();
        colorOthers(nodes);

        console.log('clicked featured');

        // Define the Wikipedia page preview
        if (!node) {                                                // If there is no node selected/clicked
            l.id.hide('wikipedia_preview');                         // Hide the wikipedia preview
            l.id.removeClass('wikipedia_preview', 'show');
            return;
        }

        /* Show the wikipedia preview */
        l.id.show('wikipedia_preview');                             // Show the wikipedia container
        l.id.addClass('wikipedia_preview', 'show');
        l.id.updateHtml('wikipedia_preview', "<iframe src='https://en.m.wikipedia.org/wiki/" + node.name + "'><iframe>");

        // Make sure the nav tips are not displayed
        // @todo $('div.graph-nav-info').hide();

        // sets current node color and opacity
        if (!node.visited) {
            node.color = 0xff00ff;
            node.opacity = 1;
        }

        node.visited = !node.visited; // toggle visited
        colorLinks(nodes, links);
        Graph.cooldownTicks(0);
    }


    /* color all nodes but the current one (must come before visited node coloring) */
    function colorOthers (nodes) {
        nodes.forEach(function (node) {
            if (node.visited) {
                node.color = 0x00ff00;
                node.opacity = 1;
            } else {
                node.color = 0x0000ff;
                node.opacity = 1;
            }
            ;
        });
        nodes[0].color = 0xffffff;
    }


    /* colors links between visited nodes a color else a default color */
    function colorLinks (nodes, links) {
        links.forEach(function (link) {
            if (link.source.visited && link.target.visited) {
                link.color = 0x00ff00;
                // link.color=0xff0000;
                link.opacity = 1;
                // link.lineWidth=10;
            } else {
                link.color = 0x00ffff;
                link.opacity = 0.2;
                // link.lineWidth=1;
            }
        });
    }
}
// function addLabels(){
// 	state.forceGraph.graphData().nodes.forEach(function (node) {
// 		var sprite = new _class(node.name);
// 		sprite.color = 'teal';
// 		sprite.position.x = node.x;
// 		sprite.position.y = node.y;
// 		sprite.position.z = node.z;
// 		state.scene.add(sprite);
// 	});
// },

function wikimap() {
    console.log("Custom is running");
    events();                           // Start all of the event listeners
}


export default wikimap;