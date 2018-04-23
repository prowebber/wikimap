import v from './globals.js';
import wikimap from './custom.js';
import tinycolor from 'tinycolor2';
import SpriteText from 'three-spritetext';
import ThreeTrackballControls from 'three-trackballcontrols';
import {
	AmbientLight, AxesHelper, BufferAttribute, BufferGeometry, Camera, Color, DirectionalLight, FogExp2, SphereGeometry, CylinderGeometry,
  	Line, LineBasicMaterial, Matrix4, Mesh, MeshLambertMaterial, Object3D, PerspectiveCamera, Scene, Raycaster, Sprite, Vector2, Vector3, WebGLRenderer
} from 'three';

const three = window.THREE // Prefer consumption from global THREE, if exists
	? window.THREE :
	{
	AmbientLight, AxesHelper, BufferAttribute, BufferGeometry, Camera, Color, DirectionalLight, FogExp2, SphereGeometry, CylinderGeometry,
	Line, LineBasicMaterial, Matrix4, Mesh, MeshLambertMaterial, Object3D, PerspectiveCamera, Scene, Raycaster, Sprite, Vector2, Vector3, WebGLRenderer
  };

import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceManyBody as d3ForceManyBody,
  forceCenter as d3ForceCenter
} from 'd3-force-3d';

import graph from 'ngraph.graph';
import forcelayout from 'ngraph.forcelayout';
import forcelayout3d from 'ngraph.forcelayout3d';
const ngraph = { graph, forcelayout, forcelayout3d };

import Kapsule from 'kapsule';
import accessorFn from 'accessor-fn';
// import { schemePaired } from 'd3-scale-chromatic';
import tinyColor from 'tinycolor2';

const colorStr2Hex = str => isNaN(str) ? parseInt(tinyColor(str).toHex(), 16) : str;
const colorAlpha = str => isNaN(str) ? tinyColor(str).getAlpha(): 1;

// Autoset attribute colorField by colorByAccessor property
// If an object has already a color, don't set it
// Objects can be nodes or links
function autoColorObjects(objects, colorByAccessor, colorField) {
	if (!colorByAccessor || typeof colorField !== 'string') return;

	const colors = schemePaired; // Paired color set from color brewer

	const uncoloredObjects = objects.filter(obj => !obj[colorField]);
	const objGroups = {};

	uncoloredObjects.forEach(obj => { objGroups[colorByAccessor(obj)] = null });
	Object.keys(objGroups).forEach((group, idx) => { objGroups[group] = idx });

	uncoloredObjects.forEach(obj => {
		obj[colorField] = colors[objGroups[colorByAccessor(obj)] % colors.length];
	});
}
//

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
    nodeThreeObject: {},
    linkSource: { default: 'source' },
    linkTarget: { default: 'target' },
    linkColor: { default: 'color' },
    linkAutoColorBy: {},
    linkOpacity: { default: 0.2 },
    linkWidth: {}, // Rounded to nearest decimal. For falsy values use dimensionless line with 1px regardless of distance.
    linkResolution: { default: 6 }, // how many radial segments in each line cylinder's geometry
    linkDirectionalParticles: { default: 0 }, // animate photons travelling in the link direction
    linkDirectionalParticleSpeed: { default: 0.01, triggerUpdate: false }, // in link length ratio per frame
    linkDirectionalParticleWidth: { default: 0.5 },
    linkDirectionalParticleColor: {},
    linkDirectionalParticleResolution: { default: 4 }, // how many slice segments in the particle sphere's circumference
    forceEngine: { default: 'd3' }, // d3 or ngraph
    d3AlphaDecay: { default: 0.0228, triggerUpdate: false, onChange(alphaDecay, state) { state.d3ForceLayout.alphaDecay(alphaDecay) }},
    d3AlphaTarget: { default: 0, triggerUpdate: false, onChange(alphaTarget, state) { state.d3ForceLayout.alphaTarget(alphaTarget) }},
    d3VelocityDecay: { default: 0.4, triggerUpdate: false, onChange(velocityDecay, state) { state.d3ForceLayout.velocityDecay(velocityDecay) } },
    warmupTicks: { default: 0, triggerUpdate: false }, // how many times to tick the force engine at init before starting to render
    cooldownTicks: { default: Infinity, triggerUpdate: false },
    cooldownTime: { default: 15000, triggerUpdate: false }, // ms
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
    onLoading: { default: () => {}, triggerUpdate: false },
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
	 // cameraPosition: function(state, position, lookAt) {
		//   // Setter
		//   if (position) {
		// 	  const { x, y, z } = position;
		// 	  if (x !== undefined) state.camera.position.x = x;
		// 	  if (y !== undefined) state.camera.position.y = y;
		// 	  if (z !== undefined) state.camera.position.z = z;
		// 	  state.tbControls.target = lookAt
		// 		  ? new three.Vector3(lookAt.x, lookAt.y, lookAt.z)
		// 		  : state.forceGraph.position;
	 //
		// 	  return this;
		//   }
		//   // Getter
		//   return state.camera.position;
	 // },
    // reset cooldown state
    resetCountdown: function(state) {
      state.cntTicks = 0;
      state.startTickTime = new Date();
      state.engineRunning = true;
      return this;
    },
    tickFrame: function(state) {
      const isD3Sim = state.forceEngine !== 'ngraph';

      if (state.engineRunning) { layoutTick(); }
      updatePhotons();

      return this;

      //

      function layoutTick() {
        if (++state.cntTicks > state.cooldownTicks || (new Date()) - state.startTickTime > state.cooldownTime) {
          state.engineRunning = false; // Stop ticking graph
        } else {
          state.layout[isD3Sim ? 'tick' : 'step'](); // Tick it
        }

        // Update nodes position
        state.graphData.nodes.forEach(node => {
          const obj = node.__threeObj;
          if (!obj) return;

          const pos = isD3Sim ? node : state.layout.getNodePosition(node[state.nodeId]);

          obj.position.x = pos.x;
          obj.position.y = pos.y || 0;
          obj.position.z = pos.z || 0;
        });

        // Update links position
        state.graphData.links.forEach(link => {
          const line = link.__lineObj;
          if (!line) return;

          const pos = isD3Sim
            ? link
            : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? 'source' : 'from'];
          const end = pos[isD3Sim ? 'target' : 'to'];

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
            const vStart = new three.Vector3(start.x, start.y || 0, start.z || 0);
            const vEnd = new three.Vector3(end.x, end.y || 0, end.z || 0);
            const distance = vStart.distanceTo(vEnd);

            line.position.x = vStart.x;
            line.position.y = vStart.y;
            line.position.z = vStart.z;
            line.lookAt(vEnd);
            line.scale.z = distance;
          }
        });
      }

      function updatePhotons() {
        // update link particle positions
        const particleSpeedAccessor = accessorFn(state.linkDirectionalParticleSpeed);
        state.graphData.links.forEach(link => {
          const photons = link.__photonObjs;
          if (!photons || !photons.length) return;

          const pos = isD3Sim
            ? link
            : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? 'source' : 'from'];
          const end = pos[isD3Sim ? 'target' : 'to'];

          const particleSpeed = particleSpeedAccessor(link);

          photons.forEach((photon, idx) => {
            const photonPosRatio = photon.__progressRatio =
              ((photon.__progressRatio || (idx / photons.length)) + particleSpeed) % 1;

            ['x', 'y', 'z'].forEach(dim =>
                photon.position[dim] = start[dim] + (end[dim] - start[dim]) * photonPosRatio || 0
            );
          });
        });
      }
    }
  },

  stateInit: () => ({
    d3ForceLayout: d3ForceSimulation()
      .force('link', d3ForceLink())
      .force('charge', d3ForceManyBody())
      .force('center', d3ForceCenter())
      .stop(),
    engineRunning: false,

	  // below from app.js

	  renderer: new three.WebGLRenderer({ alpha: true }),
	  scene: new three.Scene(),
	  camera: new three.PerspectiveCamera(),
	  lastSetCameraZ: 0,
	  // forceGraph: v.Graph

	  //end app.js code
  }),

  init(domNode, state) {
    // Main three object to manipulate
    // state.graphScene = threeObj;

    // below from app.js (old file)

	  // Wipe DOM
	  domNode.innerHTML = '';

	  // Add nav info section
	  domNode.appendChild(state.navInfo = document.createElement('div'));
	  state.navInfo.className = 'graph-nav-info';
	  state.navInfo.textContent = "Left-click: Rotate, Right-click: Pan, Scroll: Zoom";
	  v.nav_info = state.navInfo;
	  // Add info space.
	  var infoElem;
	  domNode.appendChild(infoElem = document.createElement('div'));
	  infoElem.className = 'graph-info-msg';
	  infoElem.textContent = '';
	  state.enableNodeDrag = false;				// Prevents drag when clicking on a node
	  state.nodeOpacity = 1;
	  state.linkWidth = 5;
	  state.forceGraph = v.Graph;
	  state.forceGraph.onLoading(() => { infoElem.textContent = 'wait for it...' });
	  state.forceGraph.onFinishLoading(() => {
		  console.log('finish loading b')
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
					  devare(node.__initialFixedPos);
				  }

				  state.forceGraph
					  .d3AlphaTarget(0)   // release engine low intensity
					  .resetCountdown();  // var the engine readjust after releasing fixed nodes

				  state.tbControls.enabled = true; // Re-enable trackball controls

				  // clear cursor
				  state.renderer.domElement.classList.remove('grabbable');
			  });
		  }
		  state.forceGraph.graphData().nodes.forEach(function (node) {
			  var sprite = new SpriteText(node.name);
			  sprite.color = 'teal';
			  sprite.material.fog = true;
			  sprite.position.y = 20;
			  sprite.textHeight = 5;
			  sprite.renderOrder = 11;
			  node.__threeObj.add(sprite);
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
	  state.tbControls = new ThreeTrackballControls(state.camera, state.renderer.domElement);
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

	  v.animate = function animate() { // IIFE
		  if (state.enablePointerInteraction) {
			  // Update tooltip and trigger onHover events
			  raycaster.linePrecision = state.linkHoverPrecision;
			  console.log('memory leak');
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
		  state.renderer.render(state.scene, state.camera);
		  state.tbControls.update();
		  if (!v.freeze_graph){
			  v.frame_id = state.animationFrameRequestId = requestAnimationFrame(v.animate);
		  }
	  };
	  v.frame_id = state.animationFrameRequestId = requestAnimationFrame(v.animate);
  },
	//end of app.js copied code

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

    // if (state.nodeAutoColorBy !== null) {
    //   // Auto add color to uncolored nodes
    //   autoColorObjects(state.graphData.nodes, accessorFn(state.nodeAutoColorBy), state.nodeColor);
    // }
    // if (state.linkAutoColorBy !== null) {
    //   // Auto add color to uncolored links
    //   autoColorObjects(state.graphData.links, accessorFn(state.linkAutoColorBy), state.linkColor);
    // }

    // parse links
    state.graphData.links.forEach(link => {
      link.source = link[state.linkSource];
      link.target = link[state.linkTarget];
    });

    // Add WebGL objects
    while (state.graphScene.children.length) { state.graphScene.remove(state.graphScene.children[0]) } // Clear the place

    const customNodeObjectAccessor = accessorFn(state.nodeThreeObject);
    const valAccessor = accessorFn(state.nodeVal);
    const colorAccessor = accessorFn(state.nodeColor);
    const sphereGeometries = {}; // indexed by node value
    const sphereMaterials = {}; // indexed by color
    state.graphData.nodes.forEach(node => {
      const customObj = customNodeObjectAccessor(node);

      let obj;
      if (customObj) {
        obj = customObj;

        if (state.nodeThreeObject === obj) {
          // clone object if it's a shared object among all nodes
          obj = obj.clone();
        }
      } else { // Default object (sphere mesh)
        const val = valAccessor(node) || 1;
        if (!sphereGeometries.hasOwnProperty(val)) {
          sphereGeometries[val] = new three.SphereGeometry(Math.cbrt(val) * state.nodeRelSize, state.nodeResolution, state.nodeResolution);
        }

        const color = colorAccessor(node);
        if (!sphereMaterials.hasOwnProperty(color)) {
          sphereMaterials[color] = new three.MeshLambertMaterial({
            color: colorStr2Hex(color || '#ffffaa'),
            transparent: true,
            opacity: state.nodeOpacity * colorAlpha(color)
          });
        }

        obj = new three.Mesh(sphereGeometries[val], sphereMaterials[color]);
      }

      obj.__graphObjType = 'node'; // Add object type
      obj.__data = node; // Attach node data

      state.graphScene.add(node.__threeObj = obj);
    });

    const linkColorAccessor = accessorFn(state.linkColor);
    const linkWidthAccessor = accessorFn(state.linkWidth);
    const linkParticlesAccessor = accessorFn(state.linkDirectionalParticles);
    const linkParticleWidthAccessor = accessorFn(state.linkDirectionalParticleWidth);
    const linkParticleColorAccessor = accessorFn(state.linkDirectionalParticleColor);

    const lineMaterials = {}; // indexed by link color
    const cylinderGeometries = {}; // indexed by link width
    const particleMaterials = {}; // indexed by link color
    const particleGeometries = {}; // indexed by particle width
    state.graphData.links.forEach(link => {
      // Add line
      const color = linkColorAccessor(link);
      const linkWidth = Math.ceil(linkWidthAccessor(link) * 10) / 10;

      const useCylinder = !!linkWidth;

      let geometry;
      if (useCylinder) {
        if (!cylinderGeometries.hasOwnProperty(linkWidth)) {
          const r = linkWidth / 2;
          geometry = new three.CylinderGeometry(r, r, 1, state.linkResolution, 1, false);
          geometry.applyMatrix(new three.Matrix4().makeTranslation(0, 1 / 2, 0));
          geometry.applyMatrix(new three.Matrix4().makeRotationX(Math.PI / 2));
          cylinderGeometries[linkWidth] = geometry;
        }
        geometry = cylinderGeometries[linkWidth];
      } else { // Use plain line (constant width)
        geometry = new three.BufferGeometry();
        geometry.addAttribute('position', new three.BufferAttribute(new Float32Array(2 * 3), 3));
      }

      if (!lineMaterials.hasOwnProperty(color)) {
        lineMaterials[color] = new three.MeshLambertMaterial({
          color: colorStr2Hex(color || '#f0f0f0'),
          transparent: true,
          opacity: state.linkOpacity * colorAlpha(color)
        });
      }
      const lineMaterial = lineMaterials[color];

      const line = new three[useCylinder ? 'Mesh' : 'Line'](geometry, lineMaterial);

      line.renderOrder = 10; // Prevent visual glitches of dark lines on top of nodes by rendering them last

      line.__graphObjType = 'link'; // Add object type
      line.__data = link; // Attach link data

      state.graphScene.add(link.__lineObj = line);

      // Add photon particles
      const numPhotons = Math.round(Math.abs(linkParticlesAccessor(link)));
      const photonR = Math.ceil(linkParticleWidthAccessor(link) * 10) / 10 / 2;
      const photonColor = linkParticleColorAccessor(link) || color || '#f0f0f0';

      if (!particleGeometries.hasOwnProperty(photonR)) {
        particleGeometries[photonR] = new three.SphereGeometry(photonR, state.linkDirectionalParticleResolution, state.linkDirectionalParticleResolution);
      }
      const particleGeometry = particleGeometries[photonR];

      if (!particleMaterials.hasOwnProperty(color)) {
        particleMaterials[color] = new three.MeshLambertMaterial({
          color: colorStr2Hex(photonColor),
          transparent: true,
          opacity: state.linkOpacity * 3
        });
      }
      const particleMaterial = particleMaterials[color];

      const photons = [...Array(numPhotons)].map(() => new three.Mesh(particleGeometry, particleMaterial));
      photons.forEach(photon => state.graphScene.add(photon));
      link.__photonObjs = photons;
    });

    // Feed data to force-directed layout
    const isD3Sim = state.forceEngine !== 'ngraph';
    let layout;
    if (isD3Sim) {
      // D3-force
      (layout = state.d3ForceLayout)
        .stop()
        .alpha(1)// re-heat the simulation
        .numDimensions(state.numDimensions)
        .nodes(state.graphData.nodes)
        .force('link')
          .id(d => d[state.nodeId])
          .links(state.graphData.links);
    } else {
      // ngraph
      const graph = ngraph.graph();
      state.graphData.nodes.forEach(node => { graph.addNode(node[state.nodeId]); });
      state.graphData.links.forEach(link => { graph.addLink(link.source, link.target); });
      layout = ngraph['forcelayout' + (state.numDimensions === 2 ? '' : '3d')](graph);
      layout.graph = graph; // Attach graph reference to layout
    }

    for (let i=0; i<state.warmupTicks; i++) { layout[isD3Sim?'tick':'step'](); } // Initial ticks before starting to render

    state.layout = layout;
    this.resetCountdown();
    state.onFinishLoading();
  }
});
wikimap();
