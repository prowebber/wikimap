// custom/events.js

import v from '../globals';

import { Group as ThreeGroup } from 'three';
import ForceGraph from '../app.js';
import fromKapsule from '../kapsule-class.js';
import TrackballControls from 'three-trackballcontrols'

let ThreeForceGraph = fromKapsule(ForceGraph, ThreeGroup, true);

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
	window.addEventListener('wheel', wikiEvents);
	window.addEventListener('change', wikiEvents);
	window.addEventListener('keyup', wikiEvents);                 // Whenever someone hits a key
	window.addEventListener('keydown', wikiEvents);               // Whenever someone releases a key
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
			'input': e.target.closest('input'),
			'ul': e.target.closest('ul'),
			'li': e.target.closest('li')
		}
	}
	let doneTypingTime = 200;                                                       // Specify the time (in ms) to wait before the user is done typing
	/* Sphinx Search */
	if(e.type == 'keyup'){
		// console.log("Keydown");
		clearTimeout(v.user_interface.typing_timer);                               			// Reset the timer
		v.user_interface.typing_timer = setTimeout(showSphinxResults, doneTypingTime);		// Wait n-milliseconds and then run the specified function
	}
	if (data.type == 'keydown') {
		clearTimeout(v.user_interface.typing_timer);                          		// Reset the timer
	}
	// If the user interacts with any part of the page other than the sphinx results
	if(e.type == 'click' || e.type == 'submit'){
		if(data.dom.ul){
			let ul = data.dom.ul;
			let keyword = data.dom.li.innerHTML;
			if(ul.id == 'sphinx_results_dropdown'){
				data.dom.ul =
					console.log("Sphinx Dropdown: " + keyword);
				databaseRequest(keyword);
			}
		}
		if(v.sphinx_results_open == '1'){					// If the sphinx results are currently open/displayed
			l.id.hide('sphinx_results');					// Hide the damn results
			v.sphinx_results_open = 0;						// Set the sphinx results as closed
		}
	}

	function showSphinxResults(){
		console.log("Searching Sphinx");
		l.id.show('sphinx_results');
		l.id.updateHtml('sphinx_results', "Testing");
		v.sphinx_results_open = 1;							// Set the results as open
		var userInput = l.id.getDom('user_input').value;	// Get the user's search text
		var form_data = new FormData();
		form_data.append('user_input', userInput);
		l.ajax.sphinx(form_data, function (data) {
			l.id.updateHtml('sphinx_results', data);
			console.log("Sphinx Done: " + userInput);
		});
	}

	function hideSphinxResults(){
		console.log("sphinx hidden");
		l.id.hide('sphinx_results');
		// v.sphinx_results_open = 0;							// Set the results as closed
		//
		// l.id.show('sphinx_results');
		// l.id.updateHtml('sphinx_results', "Testing");
		// v.sphinx_results_open = 1;							// Set the results as open
		// var userInput = l.id.getDom('user_input').value;	// Get the user's search text
		// var form_data = new FormData();
		// form_data.append('user_input', userInput);
		// l.ajax.sphinx(form_data, function (data) {
		// 	l.id.updateHtml('sphinx_results', data);
		// 	console.log("Sphinx Done: " + userInput);
		// });
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
		// v.isRotating = true;
		hideSphinxResults();
	}
	else if (e.type == 'pointerdown') {
		// v.freeze_graph = false;
		// v.isRotating = true;
		// v.animate();
	}
	else if (e.type == ('pointermove' || 'wheel') && !v.isRotating && !v.engineRunning) {
		// v.freeze_graph = true;
		// v.animate();
	}
	/* Click Events */
	else if (e.type == 'click') {
		// If the user clicks on a DIV
		// v.isRotating = false;
		if(data.dom.div){
			// v.freeze_graph = true;
			var div = data.dom.div;
			if(div.id == '3d-graph'){                       // If the user clicks on the 3d-graph
				l.id.hide('wikipedia_preview');             // Hide the wikipedia preview
				l.id.removeClass('wikipedia_preview', 'show');
				clearInterval(intervalObj);
				v.nav_info.hidden = true;
				// v.freeze_graph = true;
			}
		}
	}

	/* Change Events */
	else if(e.type == 'change'){
		if(data.dom.input){
			let input = data.dom.input;

			if(input.id == 'wiki_slider'){
				let rangeVal = input.value;
				v.max_tiers = rangeVal;			// Update the global value for the range/tier
				console.log("it slid: " + rangeVal);
				let userInput = l.id.getDom('user_input').value;	// Get the user's search text
				databaseRequest(userInput);
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
	console.log("Request for: " + userInput);
	var form_data = new FormData();
	form_data.append('user_input', userInput);
	form_data.append('max_tiers', v.max_tiers);
	form_data.append('server_class', 'fetchMultiData');         // Specify the PHP class to call
	l.ajax.post(form_data, function (data) {
		var parsedData = JSON.parse(data);
		v.max_shared_links = parsedData.max_shared_links;
		v.min_shared_links = parsedData.min_shared_links;
		showGraph(parsedData.results);	// Load the graph
	});
}

const orbit_distance = 300;
var Graph = void 0;
function showGraph(jsonResponse) {
	// Old function

	// v.freeze_graph = false;
	// const elem = document.getElementById('3d-graph');
	// Graph = new ThreeForceGraph(elem)
	// 	.linkOpacity(1)
	// 	.linkWidth(1)
	// 	.nodeOpacity(1)
	// 	.nodeRelSize(4)
	// 	// .cameraPosition({z: orbit_distance})
	// 	// .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)	// hover cursor a selecting hand
	// 	// .onNodeClick(colorNode)
	// 	.graphData(jsonResponse);
	// // orbit_camera();

	const elem = l.id.getDom('3d-graph');
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	elem.appendChild(renderer.domElement);
	elem.appendChild(v.nav_info = document.createElement('div'));
	v.nav_info.className = 'graph-nav-info';
	v.nav_info.textContent = "Left-click: Rotate, Right-click: Pan, Scroll: Zoom";
	elem.appendChild(v.infoElem = document.createElement('div'));
	v.infoElem.className = 'graph-info-msg';
	v.infoElem.textContent = 'initial message';

	// Setup tooltip
	v.toolTipElem = document.createElement('div');
	v.toolTipElem.classList.add('scene-tooltip');
	elem.appendChild(v.toolTipElem);

	// Graph it
	const Graph = new ThreeForceGraph(elem)
		.linkWidth(0.5)
		.cooldownTicks(100)
		.onNodeClick(colorNode)
		.graphData(jsonResponse);

	// Setup scene
	const scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2('#000000',0.001);
	scene.add(Graph);
	scene.add(new THREE.AmbientLight(0xbbbbbb));
	scene.add(new THREE.DirectionalLight(0xffffff, 0.6));
	// Setup camera
	const camera = new THREE.PerspectiveCamera();
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
	camera.lookAt(Graph.position);
	camera.position.z = Math.cbrt(jsonResponse.nodes.length) * 75;

	// Add camera controls
	const tbControls = new TrackballControls(camera, renderer.domElement);
	tbControls.dynamicDampingFactor = 0.6;
	tbControls.minDistance = 0.1;
	tbControls.maxDistance = 20000;


	// Capture mouse coords on move

	var mousePos = new THREE.Vector2();
	mousePos.x = -2; // Initialize off canvas
	mousePos.y = -2;
	elem.addEventListener("mousemove", function (ev) {
		// update the mouse pos
		var offset = getOffset(elem),
			relPos = {
				x: ev.pageX - offset.left,
				y: ev.pageY - offset.top
			};
		mousePos.x = relPos.x / elem.width * 2 - 1;
		mousePos.y = -(relPos.y / elem.height) * 2 + 1;
		// Move tooltip
		v.toolTipElem.style.top = relPos.y + 'px';
		v.toolTipElem.style.left = relPos.x + 'px';

		v.toolTipElem.textContent = 'x: ' + mousePos.x + ', y: ' + mousePos.y
		// console.log('x: ' + mousePos.x + ', y: ' + mousePos.y);

		function getOffset(el) {
			var rect = el.getBoundingClientRect(),
				scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
				scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
		}
	}, false);

	// Handle click events on objs
	elem.addEventListener("click", function (ev) {
		// if (hoverObj) {
		// 	onClick(hoverObj);
		// }
	}, false);

	// // Kick-off renderer
	// v.animate = function animate() {
	// 	Graph.tickFrame();

	// 	// Frame cycle
	// 	tbControls.update();
	// 	renderer.render(scene, camera);
	// 	requestAnimationFrame(animate);
	// };
	// v.simulate = function simulate() {
	// 	console.log('simulate running');
	// 	// run simulation tick (force map)
	// 	Graph.tickFrame();
	// 	if (v.state.engineRunning){
	// 		v.animate();
	// 	} else if (!v.freeze_graph){
	// 		v.simulate();
	// 	}
	// }
	// v.simulate();

	v.animate = function animate() {
		// if (state.enablePointerInteraction) {
		// 	// Update tooltip and trigger onHover events
		// 	raycaster.linePrecision = state.linkHoverPrecision;
		// console.log('animate running');
		v.toolTipElem.textContent = 'x: ' + mousePos.x + ', y: ' + mousePos.y
		// console.log('x: ' + mousePos.x + ', y: ' + mousePos.y);


		// // Update tooltip and trigger onHover events
		// var raycaster = new THREE.Raycaster();
		// raycaster.linePrecision = 1;
		//
		// raycaster.setFromCamera(mousePos, camera);
		// var intersects = raycaster.intersectObjects(Graph.objects, true).map(function (_ref) {
		// 	var object = _ref.object;
		// 	return object;
		// }).sort(state.hoverOrderComparator);
		//
		// var topObject = intersects.length ? intersects[0] : null;
		//
		// if (topObject !== state.hoverObj) {
		// 	state.onHover(topObject, state.hoverObj);
		// 	state.toolTipElem.innerHTML = topObject ? accessorFn(state.tooltipContent)(topObject) || '' : '';
		// 	state.hoverObj = topObject;
		// }



		// 	// IIFE
		// 	if (state.onFrame) state.onFrame()
		// 	raycaster.setFromCamera(mousePos, state.camera);
		// 	const intersects = raycaster.intersectObjects(state.forceGraph.children)
		// 		.filter(o => ['node', 'link'].indexOf(o.object.__graphObjType) !== -1) // Check only node/link objects
		// 		.sort((a, b) => { // Prioritize nodes over links
		// 			const isNode = o => o.object.__graphObjType === 'node';
		// 			return isNode(b) - isNode(a);
		// 		});
		//
		// 	const topObject = intersects.length ? intersects[0].object : null;
		//
		// 	if (topObject !== state.hoverObj) {
		// 		const prevObjType = state.hoverObj ? state.hoverObj.__graphObjType : null;
		// 		const prevObjData = state.hoverObj ? state.hoverObj.__data : null;
		// 		const objType = topObject ? topObject.__graphObjType : null;
		// 		const objData = topObject ? topObject.__data : null;
		// 		if (prevObjType && prevObjType !== objType) {
		// 			// Hover out
		// 			state[`on${prevObjType === 'node' ? 'Node' : 'Link'}Hover`](null, prevObjData);
		// 		}
		// 		if (objType) {
		// 			// Hover in
		// 			state[`on${objType === 'node' ? 'Node' : 'Link'}Hover`](objData, prevObjType === objType ? prevObjData : null);
		// 		}
		//
		// 		toolTipElem.innerHTML = topObject ? accessorFn(state[`${objType}Label`])(objData) || '' : '';
		//
		// 		state.hoverObj = topObject;
		// 	}
		// 	// reset canvas cursor (override dragControls cursor)
		// 	state.renderer.domElement.style.cursor = null;
		// }
		Graph.tickFrame();
		renderer.render(scene, camera);
		tbControls.update();
		if (!v.freeze_graph){
			requestAnimationFrame(animate);
		}
		// requestAnimationFrame(animate);
	};
	v.animate()
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
		// distance_from_center(node);
		if (node.visited) {
			node.color = '#00ff00';	// visted nodes green
		} else {
			node.color = 'teal';	// revert back to teal if deselected
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

export function wikimap() {
	events();                           // Start all of the event listeners
	// offlineRequest();
}