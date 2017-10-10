var camera, scene, renderer, mesh, material, controls, container;
init();
animate();
addCubes();
render();


function addCubes() {
	var xDistance = 20;
	var yDistance = 20;
    var zDistance = 20;
    var geometry = new THREE.DodecahedronGeometry(4,0);
    var material = new THREE.MeshBasicMaterial({color:0x00fffff});
    var wireMaterial = new THREE.MeshBasicMaterial({color:0x000000,wireframe:true});
    var lineMaterial = new THREE.LineBasicMaterial({color:0xffffff});
	
    for(var i = 0; i < 20; i++){
        for(var j = 0; j < 20; j++){
        	for(var k = 0; k < 20; k++){
        		var mesh  = new THREE.Mesh(geometry, material);
        		mesh.position.x = (xDistance * i);
        		mesh.position.y = (yDistance * k);
        		mesh.position.z = (zDistance * j);
        		scene.add(mesh);
        		var mesh  = new THREE.Mesh(geometry, wireMaterial);
        		mesh.position.x = (xDistance * i);
        		mesh.position.y = (yDistance * k);
        		mesh.position.z = (zDistance * j);
        		scene.add(mesh);
				var mesh  = new THREE.Mesh(geometry, material);
        		mesh.position.x = (-xDistance * i);
        		mesh.position.y = (-yDistance * k);
        		mesh.position.z = (-zDistance * j);
        		scene.add(mesh);
        		var mesh  = new THREE.Mesh(geometry, wireMaterial);
        		mesh.position.x = (-xDistance * i);
        		mesh.position.y = (-yDistance * k);
        		mesh.position.z = (-zDistance * j);
        		scene.add(mesh);
        	}
        }
    };
}

function init() {
	container = document.getElementById( 'container' );
    // Renderer.
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Add renderer to page
    document.body.appendChild(renderer.domElement);
    //container.appendChild( renderer.domElement );

    // Create camera.
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    controls = new THREE.DeviceOrientationControls( camera );
    camera.position.z = 100;
    
    // Add controls
    controls = new THREE.TrackballControls( camera );
    controls.addEventListener( 'change', render );

    // Create scene.
    scene = new THREE.Scene();

    // Create ambient light and add to scene.
    var light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);

    // Create directional light and add to scene.
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Add listener for window resize.
    window.addEventListener('resize', onWindowResize, false);
}

function getCenterPoint(mesh) {
    var geometry = mesh.geometry;
    geometry.computeBoundingBox();   
    center = geometry.boundingBox.getCenter();
    mesh.localToWorld( center );
    return center;
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}