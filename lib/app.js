import {
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
} from 'three';
// import * as THREE from 'three';

// var THREE = require('three');
import './server-bridge.js';
import {showWikimapLabels} from './server-bridge.js';
import v from './globals.js';
import tinycolor from 'tinycolor2';

const three = window.THREE
	? window.THREE // Prefer consumption from global THREE, if exists
	: {
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

import accessorFn from 'accessor-fn';
import Kapsule from 'kapsule';

// import linkKapsule from './kapsule-link.js';
import linkKapsule from './../node_modules/3d-force-graph/src/kapsule-link.js';
//

const CAMERA_DISTANCE2NODES_FACTOR = 150;

//

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

//

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

		// Add info space
		let infoElem;
		domNode.appendChild(infoElem = document.createElement('div'));
		infoElem.className = 'graph-info-msg';
		infoElem.textContent = '';
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
		state.tbControls = new ThreeTrackballControls(state.camera, state.renderer.domElement);
		state.tbControls.minDistance = 0.1;
		state.tbControls.maxDistance = 20000;

		state.renderer.setSize(state.width, state.height);
		state.camera.far = 20000;
		// state.camera.up = new Vector3(0,-1,0)

		// Populate scene
		state.scene.add(state.forceGraph);
		// Create Global coordiate System triad
		if (v.show_GCS_triad) state.scene.add(new AxesHelper(50));
		state.scene.fog = new three.FogExp2(0x000000,0.0015);
		state.scene.add(new three.AmbientLight(0xbbbbbb));
		state.scene.add(new three.DirectionalLight(0xffffff, 0.6));

		//
		var matrix_axis_flip = new Matrix4();
		matrix_axis_flip.set(  1,  0,  0,  0,
								0,  1,  0,  0,
								0,  0,  1,  0,
								0,  0,   0,  1);
		// Kick-off renderer
		(function animate() { // IIFE
			if (state.enablePointerInteraction) {
				// Update tooltip and trigger onHover events
				raycaster.linePrecision = state.linkHoverPrecision;
				// console.log('memory leak');
				// IIFE
				if (state.onFrame) state.onFrame()
				v.node_labels = [];
				v.z_array = [];
				state.graphData.nodes.forEach(function (node){
					// state.scene.updateMatrixWorld();
					var pos = new Vector3(node.x,node.y, node.z);
					// var pos = new Vector3();
					// console.log(node.__threeObj);
					// node.getWorldPosition(pos);
					var widthHalf = 0.5 * state.width;
					var heightHalf = 0.5 * state.height;
					// var pos = node.getWorldPosition();
					// var nodeObj = new Object3D();
					// nodeObj = state.scene.getObjectById(node.id);
					var vector = pos.project(state.camera);
					// var mat = new Matrix4();
					// var vector = pos.applyMatrix4(mat.multiplyMatrices(state.camera.projectionMatrix, state.camera.matrixWorldInverse));
					// vector.applyMatrix4(matrix_axis_flip);
					// // var vector = pos.applyMatrix4(state.camera.projectionMatrix);

					// var vector = new Vector3();
					// nodeObj.updateMatrixWorld();
					// vector.setFromMatrixPosition(nodeObj.matrixWorld);
					// vector.project(state.camera);
					// vector.transformDirection(matrix_axis_flip);
					vector.x = ( vector.x * widthHalf ) + widthHalf;
					vector.y = - ( vector.y * heightHalf ) + heightHalf;
					v.z_array.push(node.z);
					v.node_labels.push(vector);
				});
				v.position_sum = state.camera.position.x + state.camera.position.y + state.camera.position.z;
				if(v.position_sum != v.last_position_sum){
					showWikimapLabels(state.graphData.nodes);
				}
				v.last_position_sum = v.position_sum;
				v.state.camera.position = state.camera.position;

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

	update: function updateFn(state) {
		// resize canvas
		if (state.width && state.height) {
			state.renderer.setSize(state.width, state.height);
			state.camera.aspect = state.width/state.height;
			state.camera.updateProjectionMatrix();
		}

		state.navInfo.style.display = state.showNavInfo ? null : 'none';
	}

});