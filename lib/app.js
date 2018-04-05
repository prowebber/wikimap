import {
	AxesHelper
} from 'three';

import wikimap from './custom.js';			// Main wikimap JS
import v from './globals.js';
import tinycolor from 'tinycolor2';

const three = window.THREE	// Prefer consumption from global THREE, if exists
	? window.THREE :
	{
		WebGLRenderer,
		Scene,
		PerspectiveCamera,
		AmbientLight,
		DirectionalLight,
		Raycaster,
		Vector2,
		Vector3,
		Matrix4,
		Color,
		FogExp2,
		AxesHelper,
		Camera,
		Sprite,
		Object3D
	};

import ThreeTrackballControls from 'three-trackballcontrols';
import ThreeDragControls from 'three-dragcontrols';
import ThreeForceGraph from 'three-forcegraph';
import SpriteText from 'three-spritetext';
import accessorFn from 'accessor-fn';
import Kapsule from 'kapsule';
import linkKapsule from '3d-force-graph/src/kapsule-link.js';

const CAMERA_DISTANCE2NODES_FACTOR = 80;

// Expose config from forceGraph
const bindFG = linkKapsule('forceGraph', ThreeForceGraph);
const linkedFGProps = Object.assign(...[
	'jsonUrl',
	'graphData',
	'numDimensions',
	'nodeRelSize',
	'nodeId',
	'nodeVal',
	'nodeResolution',
	'nodeColor',
	'nodeAutoColorBy',
	'nodeOpacity',
	'nodeThreeObject',
	'linkSource',
	'linkTarget',
	'linkColor',
	'linkAutoColorBy',
	'linkOpacity',
	'linkWidth',
	'linkResolution',
	'linkDirectionalParticles',
	'linkDirectionalParticleSpeed',
	'linkDirectionalParticleWidth',
	'linkDirectionalParticleColor',
	'linkDirectionalParticleResolution',
	'forceEngine',
	'd3AlphaDecay',
	'd3VelocityDecay',
	'warmupTicks',
	'cooldownTicks',
	'cooldownTime'
].map(p => ({ [p]: bindFG.linkProp(p)})));
const linkedFGMethods = Object.assign(...[
	'd3Force'
].map(p => ({ [p]: bindFG.linkMethod(p)})));


export default Kapsule({

	props: {
		width: { default: window.innerWidth },
		height: { default: window.innerHeight },
		backgroundColor: {
			default: '#000000',
			onChange(bckgColor, state) {
				const alpha = tinycolor(bckgColor).getAlpha();
				state.renderer.setClearColor(new three.Color(bckgColor), alpha);
			},
			triggerUpdate: false
		},
		linkWidth: {default: 5},
		showNavInfo: { default: true },
		nodeLabel: { default: 'name', triggerUpdate: false },
		linkLabel: { default: 'name', triggerUpdate: false },
		linkHoverPrecision: { default: 1, triggerUpdate: false },
		enablePointerInteraction: { default: true, onChange(_, state) { state.hoverObj = null; }, triggerUpdate: false },
		enableNodeDrag: { default: true, triggerUpdate: false },
		onNodeClick: { default: () => {}, triggerUpdate: false },
		onNodeHover: { default: () => {}, triggerUpdate: false },
		onLinkClick: { default: () => {}, triggerUpdate: false },
		onLinkHover: { default: () => {}, triggerUpdate: false },
		...linkedFGProps
	},

	aliases: { // Prop names supported for backwards compatibility
		nameField: 'nodeLabel',
		idField: 'nodeId',
		valField: 'nodeVal',
		colorField: 'nodeColor',
		autoColorBy: 'nodeAutoColorBy',
		linkSourceField: 'linkSource',
		linkTargetField: 'linkTarget',
		linkColorField: 'linkColor',
		lineOpacity: 'linkOpacity'
	},

	methods: {
		cameraPosition: function(state, position, lookAt) {
			// Setter
			if (position) {
				const { x, y, z } = position;
				if (x !== undefined) state.camera.position.x = x;
				if (y !== undefined) state.camera.position.y = y;
				if (z !== undefined) state.camera.position.z = z;
				state.tbControls.target = lookAt
					? new three.Vector3(lookAt.x, lookAt.y, lookAt.z)
					: state.forceGraph.position;

				return this;
			}

			// Getter
			return state.camera.position;
		},
		// getNode: function(state,id){
		// 	return state.graphData.nodes[id];
		// },
		stopAnimation: function(state) {
			if (state.animationFrameRequestId) {
				cancelAnimationFrame(state.animationFrameRequestId);
			}
			return this;
		},
		...linkedFGMethods
	},
	stateInit: () => ({
		renderer: new three.WebGLRenderer({ alpha: true }),
		scene: new three.Scene(),
		camera: new three.PerspectiveCamera(),
		lastSetCameraZ: 0,
		forceGraph: new ThreeForceGraph()
	}),

	init: function(domNode, state) {
		// Wipe DOM
		domNode.innerHTML = '';

		// Add nav info section
		domNode.appendChild(state.navInfo = document.createElement('div'));
		state.navInfo.className = 'graph-nav-info';
		state.navInfo.textContent = "Left-click: Rotate, Right-click: Pan, Scroll: Zoom";
		v.nav_info = state.navInfo;
		// Add info space
		let infoElem;
		domNode.appendChild(infoElem = document.createElement('div'));
		infoElem.className = 'graph-info-msg';
		infoElem.textContent = '';
		state.enableNodeDrag = false;				// Prevents drag when clicking on a node
		state.nodeOpacity = 1;
		state.linkWidth = 5;
		state.forceGraph.onLoading(() => { infoElem.textContent = 'wait for it...' });
		state.forceGraph.onFinishLoading(() => {
			infoElem.textContent = '';
			// re-aim camera, if still in default position (not user modified)
			if (state.camera.position.x === 0 && state.camera.position.y === 0 && state.camera.position.z === state.lastSetCameraZ) {
				state.camera.lookAt(state.forceGraph.position);
				state.lastSetCameraZ = state.camera.position.z = Math.cbrt(state.forceGraph.graphData().nodes.length) * CAMERA_DISTANCE2NODES_FACTOR;
			}

			// Setup node drag interaction
			if (state.enableNodeDrag && state.enablePointerInteraction && state.forceEngine === 'd3') { // Can't access node positions programatically in ngraph
				const dragControls = new ThreeDragControls(
					state.forceGraph.graphData().nodes.map(node => node.__threeObj),
					state.camera,
					state.renderer.domElement
				);

				dragControls.addEventListener('dragstart', function (event) {
					state.tbControls.enabled = false; // Disable trackball controls while dragging

					const node = event.object.__data;
					node.__initialFixedPos = {fx: node.fx, fy: node.fy, fz: node.fz};

					// lock node
					['x', 'y', 'z'].forEach(c => node[`f${c}`] = node[c]);

					// keep engine running at low intensity throughout drag
					state.forceGraph.d3AlphaTarget(0.3);

					// drag cursor
					state.renderer.domElement.classList.add('grabbable');
				});

				dragControls.addEventListener('drag', function (event) {
					state.ignoreOneClick = true; // Don't click the node if it's being dragged

					const node = event.object.__data;

					// Move fx/fy/fz (and x/y/z) of nodes based on object new position
					['x', 'y', 'z'].forEach(c => node[`f${c}`] = node[c] = event.object.position[c]);

					// prevent freeze while dragging
					state.forceGraph.resetCountdown();
				});

				dragControls.addEventListener('dragend', function (event) {
					const node = event.object.__data;
					const initPos = node.__initialFixedPos;

					if (initPos) {
						['x', 'y', 'z'].forEach(c => {
							const fc = `f${c}`;
							if (initPos[fc] === undefined) {
								node[fc] = undefined
							}
						});
						delete(node.__initialFixedPos);
					}

					state.forceGraph
						.d3AlphaTarget(0)   // release engine low intensity
						.resetCountdown();  // let the engine readjust after releasing fixed nodes

					state.tbControls.enabled = true; // Re-enable trackball controls

					// clear cursor
					state.renderer.domElement.classList.remove('grabbable');
				});
			}
			state.forceGraph.graphData().nodes.forEach(function (node) {
				var sprite = new SpriteText(node.name);
				// node.__threeObj.color = 0xff00ff;
				sprite.color = 'teal';
				sprite.material.fog = true;
				sprite.position.y = 20;
				sprite.textHeight = 5;
				sprite.renderOrder = 11;
				node.visited = false;
				node.__threeObj.add(sprite);
			});
			state.forceGraph.graphData().links.forEach(function (link) {
				// link.linkWidth = 10;
			});
		});

		// Setup tooltip
		const toolTipElem = document.createElement('div');
		toolTipElem.classList.add('graph-tooltip');
		domNode.appendChild(toolTipElem);

		// Capture mouse coords on move
		const raycaster = new three.Raycaster();
		const mousePos = new three.Vector2();
		mousePos.x = -2; // Initialize off canvas
		mousePos.y = -2;
		domNode.addEventListener("mousemove", ev => {
			// update the mouse pos
			const offset = getOffset(domNode),
				relPos = {
					x: ev.pageX - offset.left,
					y: ev.pageY - offset.top
				};
			mousePos.x = (relPos.x / state.width) * 2 - 1;
			mousePos.y = -(relPos.y / state.height) * 2 + 1;

			// Move tooltip
			toolTipElem.style.top = `${relPos.y}px`;
			toolTipElem.style.left = `${relPos.x}px`;

			function getOffset(el) {
				const rect = el.getBoundingClientRect(),
					scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
					scrollTop = window.pageYOffset || document.documentElement.scrollTop;
				return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
			}
		}, false);

		// Handle click events on nodes
		domNode.addEventListener("click", ev => {
			if (state.ignoreOneClick) {
				// f.e. because of dragend event
				state.ignoreOneClick = false;
				return;
			}

			if (state.hoverObj) {
				state[`on${state.hoverObj.__graphObjType === 'node' ? 'Node' : 'Link'}Click`](state.hoverObj.__data);
			}
		}, false);

		// Setup renderer, camera and controls
		domNode.appendChild(state.renderer.domElement);
		state.tbControls = new ThreeTrackballControls(state.camera, state.renderer.domElement)
		state.tbControls.dynamicDampingFactor = 0.6;
		state.tbControls.minDistance = 0.1;
		state.tbControls.maxDistance = 20000;

		state.renderer.setSize(state.width, state.height);
		state.camera.far = 20000;

		// Populate scene
		state.scene.add(state.forceGraph);
		// Create Global coordiate System triad
		if (v.show_GCS_triad) state.scene.add(new AxesHelper(50));
		state.scene.fog = new three.FogExp2(state.backgroundColor,0.0025);
		state.scene.add(new three.AmbientLight(0xbbbbbb));
		state.scene.add(new three.DirectionalLight(0xffffff, 0.6));

		(function animate() { // IIFE
			if (state.enablePointerInteraction) {
				// Update tooltip and trigger onHover events
				raycaster.linePrecision = state.linkHoverPrecision;
				// console.log('memory leak');
				// IIFE
				if (state.onFrame) state.onFrame()
				raycaster.setFromCamera(mousePos, state.camera);
				const intersects = raycaster.intersectObjects(state.forceGraph.children)
					.filter(o => ['node', 'link'].indexOf(o.object.__graphObjType) !== -1) // Check only node/link objects
					.sort((a, b) => { // Prioritize nodes over links
						const isNode = o => o.object.__graphObjType === 'node';
						return isNode(b) - isNode(a);
					});

				const topObject = intersects.length ? intersects[0].object : null;

				if (topObject !== state.hoverObj) {
					const prevObjType = state.hoverObj ? state.hoverObj.__graphObjType : null;
					const prevObjData = state.hoverObj ? state.hoverObj.__data : null;
					const objType = topObject ? topObject.__graphObjType : null;
					const objData = topObject ? topObject.__data : null;
					if (prevObjType && prevObjType !== objType) {
						// Hover out
						state[`on${prevObjType === 'node' ? 'Node' : 'Link'}Hover`](null, prevObjData);
					}
					if (objType) {
						// Hover in
						state[`on${objType === 'node' ? 'Node' : 'Link'}Hover`](objData, prevObjType === objType ? prevObjData : null);
					}

					toolTipElem.innerHTML = topObject ? accessorFn(state[`${objType}Label`])(objData) || '' : '';

					state.hoverObj = topObject;
				}
				// reset canvas cursor (override dragControls cursor)
				state.renderer.domElement.style.cursor = null;
			}
			// Frame cycle
			state.forceGraph.tickFrame();
			state.tbControls.update();
			state.renderer.render(state.scene, state.camera);
			state.animationFrameRequestId = requestAnimationFrame(animate);
		})();
	},
	// setObjectQuaternion: function setObjectQuaternion() {
	// 	var zee = new THREE.Vector3( 0, 0, 1 );
	// 	var euler = new THREE.Euler();
	// 	var q0 = new THREE.Quaternion();
	// 	var q1 = new THREE.Quaternion(  - Math.sqrt( 0.5 ), 0, 0,  Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis
	// 	//beta=beta-180;
	// 	return function ( quaternion, alpha, beta, gamma, orient ) {
	// 		euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us
	// 		quaternion.setFromEuler( euler );                               // orient the device
	// 		quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top
	// 		quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation
	// 	}
	// }(),
	// Quat2Angle: function Quat2Angle( x, y, z, w ) {
	// 	var pitch, roll, yaw;
	// 	var test = x * y + z * w;
	// 	if (test > 0.499) { // singularity at north pole
	// 		yaw = 2 * Math.atan2(x, w);
	// 		pitch = Math.PI / 2;
	// 		roll = 0;
	// 		var euler = new THREE.Vector3( pitch, roll, yaw);
	// 		return euler;
	// 	}
	// 	if (test < -0.499) { // singularity at south pole
	// 		yaw = -2 * Math.atan2(x, w);
	// 		pitch = -Math.PI / 2;
	// 		roll = 0;
	// 		var euler = new THREE.Vector3( pitch, roll, yaw);
	// 		return euler;
	// 	}
	// 	var sqx = x * x;
	// 	var sqy = y * y;
	// 	var sqz = z * z;
	// 	yaw = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
	// 	pitch = Math.asin(2 * test);
	// 	roll = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);
	//
	// 	var euler = new THREE.Vector3( pitch, roll, yaw);
	// 	return euler;
	// },

	update: function updateFn(state) {
		// var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad(scope.deviceOrientation.alpha) : 0; // Z
		// var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad(scope.deviceOrientation.beta) : 0; // X'
		// var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad(scope.deviceOrientation.gamma) : 0; // Y''
		// var orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0; // O
		//
		// var currentQ = new THREE.Quaternion().copy(scope.object.quaternion);
		//
		// setObjectQuaternion(currentQ, alpha, beta, gamma, orient);
		// var currentAngle = Quat2Angle(currentQ.x, currentQ.y, currentQ.z, currentQ.w);
		// var radDeg = 180 / Math.PI;
		// // currentAngle.z = Left-right
		// // currentAngle.y = Up-down
		// this.rotateLeft((lastGamma - currentAngle.z) / 2);
		// lastGamma = currentAngle.z;
		// this.rotateUp(lastBeta - currentAngle.y);
		// lastBeta = currentAngle.y;

		// resize canvas
		if (state.width && state.height) {
			state.renderer.setSize(state.width, state.height);
			state.camera.aspect = state.width/state.height;
			state.camera.updateProjectionMatrix();
		}
		state.navInfo.style.display = state.showNavInfo ? null : 'none';
	}

});
wikimap();