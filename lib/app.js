import {
	AmbientLight,
	BufferAttribute,
	BufferGeometry,
	CylinderGeometry,
	DirectionalLight,
	Line,
	LineBasicMaterial,
	Matrix4,
	Mesh,
	MeshLambertMaterial,
	Raycaster,
	SphereGeometry,
	Vector2,
	Vector3
} from 'three';

import {
	forceSimulation as d3ForceSimulation,
	forceLink as d3ForceLink,
	forceManyBody as d3ForceManyBody,
	forceCenter as d3ForceCenter,
	forceCollide as d3ForceCollide
} from 'd3-force-3d';

import SpriteText from './custom/sprite-label';
import Kapsule from 'kapsule';
import accessorFn from 'accessor-fn';
import { autoColorObjects, colorStr2Hex, colorAlpha } from './color-utils';
import {v} from './globals';
export default Kapsule({

	props: {
		jsonUrl: {},
		graphData: {
			default: {
				nodes: [],
				links: []
			},
			onChange(_, state) { state.engineRunning = false; } // Pause simulation
		},
		numDimensions: {
			default: 3,
			onChange(numDim, state) {
				const chargeForce = state.d3ForceLayout.force('charge');
				// Increase repulsion on 3D mode for improved spatial separation
				if (chargeForce) { chargeForce.strength(numDim > 2 ? -60 : -30) }
				if (numDim < 3) { eraseDimension(state.graphData.nodes, 'z'); }
				if (numDim < 2) { eraseDimension(state.graphData.nodes, 'y'); }
				function eraseDimension(nodes, dim) {
					nodes.forEach(d => {
						delete d[dim];     // position
						delete d[`v${dim}`]; // velocity
					});
				}
			}
		},
		nodeRelSize: { default: 4 }, // volume per val unit
		nodeId: { default: 'id' },
		nodeVal: { default: 'val' },
		nodeResolution: { default: 8 }, // how many slice segments in the sphere's circumference
		nodeColor: { default: 'color' },
		nodeAutoColorBy: {},
		nodeOpacity: { default: 0.75 },
		linkSource: { default: 'source' },
		linkTarget: { default: 'target' },
		linkColor: { default: 'color' },
		linkAutoColorBy: {},
		linkOpacity: { default: 0.2 },
		linkWidth: {}, // Rounded to nearest decimal. For falsy values use dimensionless line with 1px regardless of distance.
		linkResolution: { default: 6 }, // how many radial segments in each line cylinder's geometry
		d3AlphaDecay: { default: 0.0228, triggerUpdate: false, onChange(alphaDecay, state) { state.d3ForceLayout.alphaDecay(alphaDecay) }},
		d3AlphaTarget: { default: 0, triggerUpdate: false, onChange(alphaTarget, state) { state.d3ForceLayout.alphaTarget(alphaTarget) }},
		d3VelocityDecay: { default: 0.4, triggerUpdate: false, onChange(velocityDecay, state) { state.d3ForceLayout.velocityDecay(velocityDecay) } },
		warmupTicks: { default: 0, triggerUpdate: false }, // how many times to tick the force engine at init before starting to render
		cooldownTicks: { default: Infinity, triggerUpdate: false },
		cooldownTime: { default: 15000, triggerUpdate: false }, // ms
		objects: { default: [], onChange: function onChange(objs, state) {
			(state.prevObjs || []).forEach(function (obj) {
				return state.scene.remove(obj);
			}); // Clear the place
			state.prevObjs = objs;
			objs.forEach(function (obj) {
				return state.scene.add(obj);
			}); // Add to scene
		},
			triggerUpdate: false },
		enablePointerInteraction: { default: true, onChange: function onChange(_, state) {
			state.hoverObj = null;
		},
			triggerUpdate: false },
		lineHoverPrecision: { default: 1, triggerUpdate: false },
		tooltipContent: { triggerUpdate: false },
		onHover: { default: function _default() {}, triggerUpdate: false },
		onClick: { default: function _default() {}, triggerUpdate: false },
		onNodeClick: { default: () => {}, triggerUpdate: false },
		onNodeHover: { default: () => {}, triggerUpdate: false },
		onLoading: { default: () => {
			v.info_elem.textContent = 'wait for it...';
		}, triggerUpdate: false },
		onFinishLoading: { default: () => {}, triggerUpdate: false }
	},

	aliases: {
		autoColorBy: 'nodeAutoColorBy'
	},

	methods: {
		// Expose d3 forces for external manipulation
		d3Force: function(state, forceName, forceFn) {
			if (forceFn === undefined) {
				return state.d3ForceLayout.force(forceName); // Force getter
			}
			state.d3ForceLayout.force(forceName, forceFn); // Force setter
			return this;
		},
		// reset cooldown state
		resetCountdown: function(state) {
			state.cntTicks = 0;
			state.startTickTime = new Date();
			state.engineRunning = true;
			return this;
		},
		tickFrame: function(state) {
			if (state.engineRunning) { layoutTick(); }
			return this;

			function layoutTick() {
				if (++state.cntTicks > state.cooldownTicks || (new Date()) - state.startTickTime > state.cooldownTime) {
					state.engineRunning = false; // Stop ticking graph
					v.loading = false;
				} else {
					state.layout['tick'](); // Tick it
				}
				// Update nodes position
				state.graphData.nodes.forEach(node => {
					const obj = node.__threeObj;
					if (!obj) return;
					const pos = node;
					obj.position.x = pos.x;
					obj.position.y = pos.y || 0;
					obj.position.z = pos.z || 0;
				});

				// Update links position
				state.graphData.links.forEach(link => {
					const line = link.__lineObj;
					if (!line) return;
					const pos = link;
					const start = pos['source'];
					const end = pos['target'];
					if (line.type === 'Line') { // Update line geometry
						const linePos = line.geometry.attributes.position;
						linePos.array[0] = start.x;
						linePos.array[1] = start.y || 0;
						linePos.array[2] = start.z || 0;
						linePos.array[3] = end.x;
						linePos.array[4] = end.y || 0;
						linePos.array[5] = end.z || 0;
						linePos.needsUpdate = true;
						line.geometry.computeBoundingSphere();
					} else { // Update cylinder geometry
						const vStart = new Vector3(start.x, start.y || 0, start.z || 0);
						const vEnd = new Vector3(end.x, end.y || 0, end.z || 0);
						const distance = vStart.distanceTo(vEnd);
						line.position.x = vStart.x;
						line.position.y = vStart.y;
						line.position.z = vStart.z;
						line.lookAt(vEnd);
						line.scale.z = distance;
					}
				});
			}
		},
		cameraPosition: function cameraPosition(state, position, lookAt, transitionDuration) {
			var camera = state.camera;

			// Setter
			if (position && state.initialised) {
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
				state.tbControls.target = new three$1.Vector3(lookAt.x, lookAt.y, lookAt.z);
			}

			function getLookAt() {
				return Object.assign(new three$1.Vector3(0, 0, -1000).applyQuaternion(camera.quaternion).add(camera.position));
			}
		},
	},

	stateInit: () => ({
		d3ForceLayout: d3ForceSimulation()
			.force('link', d3ForceLink()
				// .strength(function (d) {
				// 	return d.val/(v.max_shared_links-v.min_shared_links)*0.75;				// our function
				// // 	return 1 / Math.min(count[link.source.index], count[link.target.index]);	// default from d3
				// })
				// // // .distance(function(d){
				// // // 	return(30*d.val/(v.max_shared_links-v.min_shared_links))})
				)
			.force('charge', d3ForceManyBody()
				.strength(function(){
					return -(v.repulsive_strength);
				}))
			.force('center', d3ForceCenter())
			.force('collision', d3ForceCollide()
					.radius(function(d) {
						return d.radius*2;
					}))
			.stop(),
		engineRunning: false

	}),

	init(threeObj, state) {
		// todo move all the init code in the update function back to init
		state.graphScene = threeObj;
	},

	update(state) {
		state.engineRunning = false; // Pause simulation
		state.onLoading();

		if (state.graphData.nodes.length || state.graphData.links.length) {
			console.info('force-graph loading', state.graphData.nodes.length + ' nodes', state.graphData.links.length + ' links');
		}

		if (!state.fetchingJson && state.jsonUrl && !state.graphData.nodes.length && !state.graphData.links.length) {
			// (Re-)load data
			state.fetchingJson = true;
			fetch(state.jsonUrl).then(r => r.json()).then(json => {
				state.fetchingJson = false;
				state.graphData = json;
				state._rerender();  // Force re-update
			});
		}

		if (state.nodeAutoColorBy !== null) {
			// Auto add color to uncolored nodes
			autoColorObjects(state.graphData.nodes, accessorFn(state.nodeAutoColorBy), state.nodeColor);
		}
		if (state.linkAutoColorBy !== null) {
			// Auto add color to uncolored links
			autoColorObjects(state.graphData.links, accessorFn(state.linkAutoColorBy), state.linkColor);
		}

		// parse links
		state.graphData.links.forEach(link => {
			link.source = link[state.linkSource];
			link.target = link[state.linkTarget];
		});

		// Add WebGL objects
		while (state.graphScene.children.length) { state.graphScene.remove(state.graphScene.children[0]) } // Clear the place
		const valAccessor = accessorFn(state.nodeVal);
		const colorAccessor = accessorFn(state.nodeColor);
		const sphereGeometries = {}; // indexed by node value
		const sphereMaterials = {}; // indexed by color
		state.graphData.nodes.forEach(node => {
			let obj;
			const val = valAccessor(node) || 1;
			if (!sphereGeometries.hasOwnProperty(val)) {
				sphereGeometries[val] = new SphereGeometry(Math.cbrt(val) * state.nodeRelSize, state.nodeResolution, state.nodeResolution);
			}
			const color = colorAccessor(node);

			sphereMaterials[color] = new MeshLambertMaterial({
				color: color,
				fog: true,
				transparent: false,
				opacity: state.nodeOpacity * colorAlpha(color)
			});
			obj = new Mesh(sphereGeometries[val], sphereMaterials[color]);
			obj.__graphObjType = 'node'; // Add object type
			obj.__data = node; // Attach node data

			var sprite = new SpriteText(node.name);
			sprite.color = '#e0ecff';
			sprite.position.y = 20;
			sprite.textHeight = 5;
			sprite.renderOrder = 11;
			obj.add(sprite);

			state.graphScene.add(node.__threeObj = obj);
		});

		const linkColorAccessor = accessorFn(state.linkColor);
		const linkWidthAccessor = accessorFn(state.linkWidth);
		const lineMaterials = {}; // indexed by link color
		const cylinderGeometries = {}; // indexed by link width
		state.graphData.links.forEach(link => {
			const color = linkColorAccessor(link);
			const linkWidth = Math.ceil(linkWidthAccessor(link) * 10) / 10;
			const useCylinder = !!linkWidth;
			let geometry;
			if (useCylinder) {
				if (!cylinderGeometries.hasOwnProperty(linkWidth)) {
					const r = linkWidth / 2;
					geometry = new CylinderGeometry(r, r, 1, state.linkResolution, 1, false);
					geometry.applyMatrix(new Matrix4().makeTranslation(0, 1 / 2, 0));
					geometry.applyMatrix(new Matrix4().makeRotationX(Math.PI / 2));
					cylinderGeometries[linkWidth] = geometry;
				}
				geometry = cylinderGeometries[linkWidth];
			} else { // Use plain line (constant width)
				geometry = new BufferGeometry();
				geometry.addAttribute('position', new BufferAttribute(new Float32Array(2 * 3), 3));
			}

			if (!lineMaterials.hasOwnProperty(color)) {
				lineMaterials[color] = new MeshLambertMaterial({
					color: colorStr2Hex(color || '#f0f0f0'),
					transparent: true,
					opacity: state.linkOpacity * colorAlpha(color)
				});
			}
			const lineMaterial = lineMaterials[color];
			// const line = new three_local[useCylinder ? 'Mesh' : 'Line'](geometry, lineMaterial);
			if (useCylinder){
				var link_line = new Mesh(geometry, lineMaterial);
			} else {
				var link_line = new Line(geometry, lineMaterial);
			}
			link_line.renderOrder = 10; // Prevent visual glitches of dark lines on top of nodes by rendering them last
			link_line.__graphObjType = 'link'; // Add object type
			link_line.__data = link; // Attach link data
			state.graphScene.add(link.__lineObj = link_line);
		});

		// Feed data to force-directed layout
		let layout;
		if (v.freeze_graph){
			layout = v.layout;
		} else {
			(layout = state.d3ForceLayout)
				.stop()
				.alpha(1)// re-heat the simulation
				.numDimensions(state.numDimensions)
				.nodes(state.graphData.nodes)
				.force('link')
				.id(d => d[state.nodeId])
				.links(state.graphData.links);
			for (let i=0; i<state.warmupTicks; i++) { layout['tick'](); } // Initial ticks before starting to render
			v.layout = layout;
		}
		state.layout = layout;
		this.resetCountdown();
		state.onFinishLoading();

	}
});
