// custom/events.js

import {v, DOM} from '../globals';
import l from './library';

import {
	AmbientLight,
	DirectionalLight,
	FogExp2,
	Group as ThreeGroup,
	Object3D,
	PerspectiveCamera,
	Raycaster,
	Scene,
	Vector2,
	WebGLRenderer
} from 'three';

import ForceGraph from '../app.js';
import fromKapsule from '../kapsule-class.js';
import TrackballControls from 'three-trackballcontrols';

var ThreeForceGraph = fromKapsule(ForceGraph, ThreeGroup, true);
// import ThreeForceGraph from '../no-kapsule.js';

// todo make fromKapsule (and kapsule-class) unnecessary by writing locally
// class FromKapsule extends ForceGraph {
// 	constructor(...args) {
// 		super(...args);
// 		this.__kapsuleInstance = kapsule()(...[...(initKapsuleWithSelf ? [this] : []), ...args]);
// 	}
// }
//
// // attach kapsule props/methods to class prototype
// Object.keys(kapsule())
// 	.forEach(m => FromKapsule.prototype[m] = function(...args) {
// 		const returnVal = this.__kapsuleInstance[m](...args);
//
// 		return returnVal === this.__kapsuleInstance
// 			? this  // chain based on this class, not the kapsule obj
// 			: returnVal;
// 	});
//
// var ThreeForceGraph = FromKapsule;

var mousePos = new Vector2(-2, -2);

function wikiEvents(e) {
	var data = {
		'type': e.type,
		'key': e.key,
		'dom': {
			'div': e.target.closest('div'),
			'h1': e.target.closest('h1'),
			'form': e.target.closest('form'),
			'input': e.target.closest('input'),
			'ul': e.target.closest('ul'),
			'li': e.target.closest('li')
		}
	}
	let doneTypingTime = 200;                                                       		// Specify the time (in ms) to wait before the user is done typing

	if (e.type == 'keyup') {
		clearTimeout(v.user_interface.typing_timer);                               		// Reset the timer
		v.user_interface.typing_timer = setTimeout(showSphinxResults, doneTypingTime);		// Wait n-milliseconds and then run the specified function
	}
	if (data.type == 'keydown') {
		clearTimeout(v.user_interface.typing_timer);                          				// Reset the timer
	}
	if (e.type == 'submit') {
		e.preventDefault();									// Prevent PHP from processing the form
		var userInput = l.id.getDom('user_input').value;	// Get the user's search text
		if (!v.local_data) {
			databaseRequest(userInput);							// Call the database function
		} else {
			offlineRequest();
		}
		hideSphinxResults();
	}
	else if (e.type == 'pointerdown') {
		// v.freeze_graph = false;
		// v.isRotating = true;
		// v.animate();
	}
	else if (e.type == 'pointermove') {
		// v.freeze_graph = true;
		// v.animate();
	}
	else if (e.type == 'click') {
		if (data.dom.h1) {
			if (data.dom.h1.id == 'extend_tiers') {
				var form_data = new FormData();
				form_data.append('history', JSON.stringify(v.history));
				form_data.append('server_class', 'extendTiers');         // Specify the PHP class to call
				l.ajax.post(form_data, function (resData) {
					console.log("Stuff: " + resData);
				});
			}
		}
		// If the user clicks on a DIV
		// v.isRotating = false;
		if (data.dom.div) {
			// v.freeze_graph = true;
			var div = data.dom.div;
			if (div.id == '3d-graph') {                       // If the user clicks on the 3d-graph
				// l.id.hide('wikipedia_preview');             // Hide the wikipedia preview
				l.id.removeClass('wikipedia_preview', 'show');
				clearInterval(intervalObj);
				v.nav_info.hidden = true;
				// v.freeze_graph = true;
				const {nodes, links} = v.graph.graphData();
				if (v.hoverObj != null) {
					v.hoverObj.__data.color = '#00ff00';
					console.log(v.hoverObj.__data.name, ' clicked');
					show_wiki(v.hoverObj.__data);
					v.graph.graphData({nodes, links});
					colorNode(v.graph,v.hoverObj);
				}
			}
		}

		if (data.dom.ul) {
			let ul = data.dom.ul;
			let keyword = data.dom.li.innerHTML;
			if (ul.id == 'sphinx_results_dropdown') {
				data.dom.ul =
					console.log("Sphinx Dropdown: " + keyword);
				databaseRequest(keyword);
			}
		}
		if (v.sphinx_results_open == '1') {					// If the sphinx results are currently open/displayed
			l.id.hide('sphinx_results');					// Hide the damn results
			v.sphinx_results_open = 0;						// Set the sphinx results as closed
		}
	}
	else if (e.type == 'change') {
		if (data.dom.input) {
			let input = data.dom.input;
			if (input.id == 'wiki_slider') {
				let rangeVal = input.value;
				v.max_tiers = rangeVal;			// Update the global value for the range/tier
				console.log("it slid: " + rangeVal);
				let userInput = l.id.getDom('user_input').value;	// Get the user's search text
				databaseRequest(userInput);
			}
		}
	}

	if (e.type == 'mousemove') {
		if (DOM.elem) {
			var canvas = l.dom.findBySelector(DOM.elem, 'canvas');
			canvas.style.position = 'relative';

			var domRect = DOM.elem.getBoundingClientRect();

			if (domRect.width) {
				v.cursorPos.x = e.pageX / domRect.width * 2 - 1;
				v.cursorPos.y = -(e.pageY / canvas.clientHeight) * 2 + 1;
			}
		}

	}

	function hideSphinxResults() {
		l.id.hide('sphinx_results');
	}

	function showSphinxResults() {
		l.id.show('sphinx_results');
		l.id.updateHtml('sphinx_results', "Testing");
		v.sphinx_results_open = 1;							// Set the results as open
		var userInput = l.id.getDom('user_input').value;	// Get the user's search text
		var form_data = new FormData();
		form_data.append('user_input', userInput);
		l.ajax.sphinx(form_data, function (data) {
			l.id.updateHtml('sphinx_results', data);
		});
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

			console.log(data);
			var parsedData = JSON.parse(data);
			v.history = parsedData.history;
			v.max_shared_links = parsedData.max_shared_links;
			v.min_shared_links = parsedData.min_shared_links;
			showGraph(parsedData.results);	// Load the graph
			v.graph.coolDownTicks = 0;
			v.freeze_graph = true;
		});
	}
}

const orbit_distance = 300;

function showGraph(jsonResponse) {
	DOM.elem = l.id.getDom('3d-graph');

	// Allow the user to submit multiple queries
	DOM.elem.innerHTML = '';									// Remove all the HTML within the 3d-graph element

	const renderer = new WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	DOM.elem.appendChild(renderer.domElement);
	DOM.elem.appendChild(v.nav_info = document.createElement('div'));
	v.nav_info.className = 'graph-nav-info';
	v.nav_info.textContent = "Left-click: Rotate, Right-click: Pan, Scroll: Zoom";
	DOM.elem.appendChild(v.info_elem = document.createElement('div'));
	v.info_elem.className = 'graph-info-msg';
	v.info_elem.textContent = 'initial message';

	if (v.sphinx_results_open) {											// If the sphinx results are visible
		l.id.hide('sphinx_results');
	}
	// Setup tooltip
	v.toolTipElem = document.createElement('div');
	v.toolTipElem.classList.add('scene-tooltip');
	DOM.elem.appendChild(v.toolTipElem);

	// Graph it
	const Graph = new ThreeForceGraph(DOM.elem)
		.linkWidth(0.5)
		.cooldownTicks(100)
		.nodeColor('color')
		.graphData(jsonResponse);
	v.graph = Graph;
	// Setup scene
	const scene = new Scene();
	scene.fog = new FogExp2('#000000', 0.001);
	scene.add(v.graph);
	scene.add(new AmbientLight(0xbbbbbb));
	scene.add(new DirectionalLight(0xffffff, 0.6));
	// Setup camera
	const camera = new PerspectiveCamera();
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	camera.lookAt(Graph.position);
	camera.position.z = Math.cbrt(jsonResponse.nodes.length) * 75;

	// Add camera controls
	const tbControls = new TrackballControls(camera, renderer.domElement);
	tbControls.dynamicDampingFactor = 0.6;
	tbControls.minDistance = 0.1;
	tbControls.maxDistance = 20000;
	tbControls.rotateSpeed = 3.0;
	tbControls.zoomSpeed = 1.2;
	tbControls.panSpeed = 0.3;

	v.animate = function animate() {
		// Trigger onHover events
		var raycaster = new Raycaster();
		raycaster.linePrecision = 1;

		raycaster.setFromCamera(v.cursorPos, camera);
		var intersects = raycaster.intersectObjects(Graph.children)
			.filter(o => ['node', 'link'].indexOf(o.object.__graphObjType) !== -1) // Check only node/link objects
			.sort((a, b) => { // Prioritize nodes over links
				const isNode = o => o.object.__graphObjType === 'node';
				return isNode(b) - isNode(a);
			});
		v.hoverObj = intersects.length ? intersects[0].object : null;

		if (!v.freeze_graph) {
			Graph.tickFrame();
		}
		renderer.render(scene, camera);
		tbControls.update();
		requestAnimationFrame(animate);
	};
	v.animate()
}

var intervalObj = void 0;

// Auto orbit the camera
function orbit_camera() {
	if (Graph) {
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

function colorNode(Graph, node) {
	clearInterval(intervalObj);
	const {nodes, links} = Graph.graphData();
	console.log('graphData: ', Graph.graphData);
	colorOthers(nodes);
	show_wiki(node);
	node.color = '#ff00ff';	// highlight selected node
	node.visited = !node.visited;
	colorLinks(links);
	Graph.graphData({nodes, links})
	Graph.cooldownTicks(0);
	// Graph.cameraPosition({ x: node.x + 40, y: node.y + 40, z: node.z + 40 }, node);	// center camera on node 40 units away
}

// needed for heat map
function distance_from_center(node) {
	var center_node = Graph.graphData().nodes[0];
	var vector_distance = Math.sqrt((node.x - center_node.x) ^ 2 + (node.y - center_node.y) ^ 2 + (node.z - center_node.z) ^ 2);
	// console.log(node.name + ' distance: ' + vector_distance);
}


function show_wiki(node) {
	// Define the Wikipedia page preview
	// console.log('node: test', node);
	// if (!node) {                                                // If there is no node selected/clicked
	// 	l.id.hide('wikipedia_preview');                         // Hide the wikipedia preview
	// 	l.id.removeClass('wikipedia_preview', 'show');
	// } else {
	l.id.show('wikipedia_preview');                             // Show the wikipedia container
	l.id.addClass('wikipedia_preview', 'show');

	var wikiUrl = 'https://en.m.wikipedia.org/wiki/' + node.name.replace(/\s+/g, '_');
	console.log("Wiki URL: " + wikiUrl);
	l.id.updateHtml('wikipedia_preview', "<iframe src='https://en.m.wikipedia.org/wiki/" + node.name.replace(/\s+/g, '_') + "'><iframe>");
	// }
}

/* color all nodes but the current one (must come before visited node coloring) */
function colorOthers(nodes) {
	nodes.forEach(function (node) {
		// distance_from_center(node);
		if (node.visited) {
			node.color = '#00ff00';	// visited nodes green
		} else {
			node.color = 'blue';	// revert back to teal if deselected
		}
	});
	nodes[0].color = '#ffffff';		// make t0 node white
}

/* colors links between visited nodes a color else a default color */
function colorLinks(links) {
	links.forEach(function (link) {
		if (link.source.visited && link.target.visited) {
			link.color = '#00ff00';	// visted links green
		} else {
			link.color = '#00ffff';
		}
	});
}


export function wikimap() {
	window.onload = function () {
		window.addEventListener('click', wikiEvents);
		window.addEventListener('submit', wikiEvents);
		window.addEventListener('pointerdown', wikiEvents);
		window.addEventListener('pointermove', wikiEvents);
		window.addEventListener('mousemove', wikiEvents);
		window.addEventListener('wheel', wikiEvents);
		window.addEventListener('change', wikiEvents);
		window.addEventListener('keyup', wikiEvents);                 // Whenever someone hits a key
		window.addEventListener('keydown', wikiEvents);               // Whenever someone releases a key
	}
}