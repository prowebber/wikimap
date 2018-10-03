// custom/events.js

import {v, DOM} from '../globals';
import l from './library';

import {
	AmbientLight,
	Color,
	DirectionalLight,
	FogExp2,
	Group as ThreeGroup,
	Object3D,
	PerspectiveCamera,
	Raycaster,
	Scene,
	Vector2,
	Vector3,
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

	if (e.type == ('mousemove' || 'pointermove')) {
		if (!v.loading) {
			v.mouse_move = true;
			requestAnimationFrame(v.animate);
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
	}
	if (e.type == ('pointerdown' || 'mousedown')){
		v.mouse_down = true;
		v.animate();
	}
	if (e.type == ('pointerup' || 'mouseup')){
		v.mouse_down = false;
	}
	if (e.type == 'keyup') {
		clearTimeout(v.user_interface.typing_timer);                              	// Reset the timer

		v.user_interface.typing_timer = setTimeout(function () {					// Wait 200 milliseconds then run the query
			if (v.listener.allowSphinxResults) {									// If Sphinx results have not been disabled
				if(!v.listener.isDataLoading){										// If no data is loading
					showSphinxResults();											// Load Sphinx
				}
			}
		}, 200);
	}
	if (data.type == 'keydown') {
		clearTimeout(v.user_interface.typing_timer);                          				// Reset the timer
	}
	if (e.type == 'submit') {
		e.preventDefault();										// Prevent PHP from processing the form
		var userInput = l.id.getDom('user_input').value;		// Get the user's search text
		if (!v.local_data) {
			databaseRequest(userInput);							// Call the database function
		} else {
			offlineRequest();
		}
	}
	else if (e.type == 'click') {
		v.mouse_down = false;
		if (data.dom.h1) {
			if (data.dom.h1.id == 'extend_tiers') {
				var form_data = new FormData();
				form_data.append('history', JSON.stringify(v.history));
				form_data.append('server_class', 'extendTiers');         // Specify the PHP class to call
				l.ajax.post(form_data, function (data) {
                    var parsedData = JSON.parse(data);
                    v.history = parsedData.history;
                    v.max_shared_links = parsedData.max_shared_links;
                    v.min_shared_links = parsedData.min_shared_links;
					const { nodes, links } = v.graph.graphData();
					v.graph.cooldownTicks(100);
					v.graph.graphData({
						nodes: nodes.concat(parsedData.new_data.nodes),
						links: links.concat(parsedData.new_data.links)
					});
				});
			}
		}
		// If the user clicks on a DIV
		if (data.dom.div) {
			var div = data.dom.div;
			if (div.id == '3d-graph') {                       	// If the user clicks on the 3d-graph
				// l.id.hide('wikipedia_preview');             // Hide the wikipedia preview
				l.id.removeClass('wikipedia_preview', 'show');
				clearInterval(intervalObj);
				v.nav_info.hidden = true;
				hideSphinx();									// Hide Sphinx
				const {nodes, links} = v.graph.graphData();
				if (v.hoverObj != null && !v.mouse_down) {
					v.mouse_down = false;
					v.hoverObj.__data.visited = true;
					show_wiki(v.hoverObj.__data);
					v.graph.graphData({nodes, links});
					colorNode(v.graph, v.hoverObj);
				}
			}
			v.animate();
		}

		if (data.dom.ul) {
			let ul = data.dom.ul;
			let keyword = data.dom.li.innerHTML;
			if (ul.id == 'sphinx_results_dropdown') {
				databaseRequest(keyword);
			}
		}
	}
	else if (e.type == 'change') {
		if (data.dom.input) {
			let input = data.dom.input;
			if (input.id == 'wiki_slider') {
				let rangeVal = input.value;
				v.max_tiers = rangeVal;			// Update the global value for the range/tier
				let userInput = l.id.getDom('user_input').value;	// Get the user's search text
				databaseRequest(userInput);
			}
		}
	}



	function offlineRequest() {
		var parsedData = JSON.parse(v.default_json);
		l.id.addClass('wiki_branding', 'fade-out');             // Fade out the results
		setTimeout(function () {
				l.id.addClass('wiki_branding', 'user-active');
			},
			1500);
		v.listener.allowSphinxResults = true;						// Allow sphinx to be shown
		v.max_shared_links = parsedData.max_shared_links;
		v.min_shared_links = parsedData.min_shared_links;
		showGraph(parsedData.results);	// Load the graph
		v.graph.coolDownTicks = 0;
	}

	function databaseRequest(userInput) {
		hideSphinx();
		v.listener.isDataLoading = true;							// Specify the script is running so Sphinx won't show the results
		var form_data = new FormData();
		form_data.append('user_input', userInput);
		form_data.append('max_tiers', v.max_tiers);
		form_data.append('server_class', 'fetchMultiData');         // Specify the PHP class to call
		l.ajax.post(form_data, function (data) {
			l.id.addClass('wiki_branding', 'fade-out');             // Fade out the results
			setTimeout(function () {
					l.id.addClass('wiki_branding', 'user-active');
				},
				1500);

			var parsedData = JSON.parse(data);
			v.history = parsedData.history;
			v.max_shared_links = parsedData.max_shared_links;
			v.min_shared_links = parsedData.min_shared_links;
			showGraph(parsedData.results);	// Load the graph
			v.graph.coolDownTicks = 0;
			v.listener.allowSphinxResults = true;						// Allow sphinx to be shown
			v.listener.isDataLoading = false;							// Specify the data is no longer loading
		});
	}
}

function hideSphinx(){
	console.log("Hide sphinx");
	l.id.hide('sphinx_results');					// Hide the damn results
}
function showSphinxResults() {
	l.id.show('sphinx_results');
	l.id.updateHtml('sphinx_results', "Testing");
	var userInput = l.id.getDom('user_input').value;	// Get the user's search text
	var form_data = new FormData();
	form_data.append('user_input', userInput);
	l.ajax.sphinx(form_data, function (data) {
		console.log("Show Sphinx");
		if (v.listener.allowSphinxResults) {
			l.id.updateHtml('sphinx_results', data);
		}
		else {
			hideSphinx();
		}

	});
}

function showGraph(jsonResponse) {
	DOM.elem = l.id.getDom('3d-graph');							// Set the graph element
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
	scene.fog = new FogExp2('#000000', 0.0015);
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
	v.tbControls = tbControls;
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
		if (v.loading || v.mouse_down){requestAnimationFrame(animate)};
	};
	v.animate();
	// orbit_camera(); // begin orbit.  Could use an IIFE
}

var intervalObj = void 0;
const orbit_distance = 300;
// Auto orbit the camera
function orbit_camera() {
	if (v.graph !== null) {
		if (v.auto_orbit) {
			var angle = 0;
			intervalObj = setInterval(function () {
				v.graph.cameraPosition({
					x: orbit_distance * Math.sin(angle),
					y: 100,
					z: orbit_distance * Math.cos(angle)
				});
				angle += Math.PI / 300;
			}, 10);
		}
	}
}



function cameraPosition(state, position, lookAt, transitionDuration) {
	var camera = v.camera;

	// Setter
	if (position && v.graph.initialised) {
		var finalPos = position;
		var finalLookAt = lookAt || { x: 0, y: 0, z: 0 };

		if (!transitionDuration) {
			// no animation
			setCameraPos(finalPos);
			setLookAt(finalLookAt);
		} else {
			var camPos = Object.assign({}, camera.position);
			var camLookAt = getLookAt();
			var tweenDuration = transitionDuration / 1000; // ms > s

			TweenMax.to(camPos, tweenDuration, Object.assign({
				onUpdate: function onUpdate() {
					return setCameraPos(camPos);
				}
			}, finalPos));

			// Face direction in 1/3rd of time
			TweenMax.to(camLookAt, tweenDuration / 3, Object.assign({
				onUpdate: function onUpdate() {
					return setLookAt(camLookAt);
				}
			}, finalLookAt));
		}
		return this;
	}

	// Getter
	return Object.assign({}, camera.position, { lookAt: getLookAt() });

	//

	function setCameraPos(pos) {
		var x = pos.x,
			y = pos.y,
			z = pos.z;

		if (x !== undefined) camera.position.x = x;
		if (y !== undefined) camera.position.y = y;
		if (z !== undefined) camera.position.z = z;
	}

	function setLookAt(lookAt) {
		v.tbControls.target = new Vector3(lookAt.x, lookAt.y, lookAt.z);
	}

	function getLookAt() {
		return Object.assign(new Vector3(0, 0, -1000).applyQuaternion(camera.quaternion).add(camera.position));
	}
}

function colorNode(Graph, node) {
	clearInterval(intervalObj);
	const {nodes, links} = Graph.graphData();
	colorOthers(nodes);
	// heat_map(nodes);
	node.color = '#ff00ff';	// highlight selected node
	node.visited = !node.visited;
	colorLinks(links);
	Graph.graphData({nodes, links})
	Graph.cooldownTicks(0);
	// Graph.cameraPosition({ x: node.x + 40, y: node.y + 40, z: node.z + 40 }, node);	// center camera on node 40 units away
}

// needed for heat map
function distance_from_center(node) {
	var center_node = v.graph.graphData().nodes[0];
	var vector_distance = Math.sqrt((node.x - center_node.x)*(node.x - center_node.x) + (node.y - center_node.y) * (node.y - center_node.y) + (node.z - center_node.z) * (node.z - center_node.z));
	return vector_distance;
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
function heat_map(nodes){
/* color nodes with color scale corresponding to vector distance from center */
	let minVal = 0;
	let maxVal = 0;
	let distance_array  = Array();
	nodes.forEach(function (node){
		node.vector_distance = distance_from_center(node);		// Get all the vector distances
		distance_array.push(node.vector_distance);
	});
	minVal = Math.min(...distance_array);
	maxVal = Math.max(...distance_array);
	nodes.forEach(function (node){
		if (node.visited) {
			node.color = '#00ff00';	// visited nodes green
		} else {
			node.color =  l.colorScale(minVal,maxVal,node.vector_distance);		// Apply the color scale;
		}
	});
}
/* color all nodes but the current one (must come before visited node coloring) */
function colorOthers(nodes) {
	nodes.forEach(function (node) {
		// distance_from_center(node);
		if (node.visited) {
			node.color = '#00ff00';	// visited nodes green
		} else {
			node.color = 'blue';	// revert back to blue if deselected
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
		window.addEventListener('contextmenu', wikiEvents)
		window.addEventListener('submit', wikiEvents);
		window.addEventListener('pointerdown', wikiEvents);
		window.addEventListener('pointermove', wikiEvents);
		window.addEventListener('pointerup', wikiEvents);
		window.addEventListener('mousedown', wikiEvents);
		window.addEventListener('mousemove', wikiEvents);
		window.addEventListener('mouseup', wikiEvents);
		window.addEventListener('wheel', wikiEvents);
		window.addEventListener('change', wikiEvents);
		window.addEventListener('keyup', wikiEvents);                 // Whenever someone hits a key
		window.addEventListener('keydown', wikiEvents);               // Whenever someone releases a key
	}
}