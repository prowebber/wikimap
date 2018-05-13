var TrackballControls = function ( object, domElement ) {

	var _this = this;
	var STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.screen = { left: 0, top: 0, width: 0, height: 0 };

	this.rotateSpeed = 1.0;
	this.zoomSpeed = 1.2;
	this.panSpeed = 0.3;

	this.noRotate = false;
	this.noZoom = false;
	this.noPan = false;

	this.staticMoving = false;
	this.dynamicDampingFactor = 0.2;

	this.minDistance = 0;
	this.maxDistance = Infinity;

	/**
	 * `KeyboardEvent.keyCode` values which should trigger the different
	 * interaction states. Each element can be a single code or an array
	 * of codes. All elements are required.
	 */
	this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	// internals

	this.target = new THREE.Vector3();

	var EPS = 0.000001;

	var lastPosition = new THREE.Vector3();

	var _state = STATE.NONE,
		_prevState = STATE.NONE,

		_eye = new THREE.Vector3(),

		_movePrev = new THREE.Vector2(),
		_moveCurr = new THREE.Vector2(),

		_lastAxis = new THREE.Vector3(),
		_lastAngle = 0,

		_zoomStart = new THREE.Vector2(),
		_zoomEnd = new THREE.Vector2(),

		_touchZoomDistanceStart = 0,
		_touchZoomDistanceEnd = 0,

		_panStart = new THREE.Vector2(),
		_panEnd = new THREE.Vector2();

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.up0 = this.object.up.clone();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };


	// methods

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.screen.left = 0;
			this.screen.top = 0;
			this.screen.width = window.innerWidth;
			this.screen.height = window.innerHeight;

		} else {

			var box = this.domElement.getBoundingClientRect();
			// adjustments come from similar code in the jquery offset() function
			var d = this.domElement.ownerDocument.documentElement;
			this.screen.left = box.left + window.pageXOffset - d.clientLeft;
			this.screen.top = box.top + window.pageYOffset - d.clientTop;
			this.screen.width = box.width;
			this.screen.height = box.height;

		}

	};

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	var getMouseOnScreen = ( function () {

		var vector = new THREE.Vector2();

		return function getMouseOnScreen( pageX, pageY ) {

			vector.set(
				( pageX - _this.screen.left ) / _this.screen.width,
				( pageY - _this.screen.top ) / _this.screen.height
			);

			return vector;

		};

	}() );

	var getMouseOnCircle = ( function () {

		var vector = new THREE.Vector2();

		return function getMouseOnCircle( pageX, pageY ) {

			vector.set(
				( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
				( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.width ) // screen.width intentional
			);

			return vector;

		};

	}() );

	this.rotateCamera = ( function() {

		var axis = new THREE.Vector3(),
			quaternion = new THREE.Quaternion(),
			eyeDirection = new THREE.Vector3(),
			objectUpDirection = new THREE.Vector3(),
			objectSidewaysDirection = new THREE.Vector3(),
			moveDirection = new THREE.Vector3(),
			angle;

		return function rotateCamera() {

			moveDirection.set( _moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0 );
			angle = moveDirection.length();

			if ( angle ) {

				_eye.copy( _this.object.position ).sub( _this.target );

				eyeDirection.copy( _eye ).normalize();
				objectUpDirection.copy( _this.object.up ).normalize();
				objectSidewaysDirection.crossVectors( objectUpDirection, eyeDirection ).normalize();

				objectUpDirection.setLength( _moveCurr.y - _movePrev.y );
				objectSidewaysDirection.setLength( _moveCurr.x - _movePrev.x );

				moveDirection.copy( objectUpDirection.add( objectSidewaysDirection ) );

				axis.crossVectors( moveDirection, _eye ).normalize();

				angle *= _this.rotateSpeed;
				quaternion.setFromAxisAngle( axis, angle );

				_eye.applyQuaternion( quaternion );
				_this.object.up.applyQuaternion( quaternion );

				_lastAxis.copy( axis );
				_lastAngle = angle;

			} else if ( ! _this.staticMoving && _lastAngle ) {

				_lastAngle *= Math.sqrt( 1.0 - _this.dynamicDampingFactor );
				_eye.copy( _this.object.position ).sub( _this.target );
				quaternion.setFromAxisAngle( _lastAxis, _lastAngle );
				_eye.applyQuaternion( quaternion );
				_this.object.up.applyQuaternion( quaternion );

			}

			_movePrev.copy( _moveCurr );

		};

	}() );


	this.zoomCamera = function () {

		var factor;

		if ( _state === STATE.TOUCH_ZOOM_PAN ) {

			factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
			_touchZoomDistanceStart = _touchZoomDistanceEnd;
			_eye.multiplyScalar( factor );

		} else {

			factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

			if ( factor !== 1.0 && factor > 0.0 ) {

				_eye.multiplyScalar( factor );

			}

			if ( _this.staticMoving ) {

				_zoomStart.copy( _zoomEnd );

			} else {

				_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

			}

		}

	};

	this.panCamera = ( function() {

		var mouseChange = new THREE.Vector2(),
			objectUp = new THREE.Vector3(),
			pan = new THREE.Vector3();

		return function panCamera() {

			mouseChange.copy( _panEnd ).sub( _panStart );

			if ( mouseChange.lengthSq() ) {

				mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

				pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
				pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

				_this.object.position.add( pan );
				_this.target.add( pan );

				if ( _this.staticMoving ) {

					_panStart.copy( _panEnd );

				} else {

					_panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

				}

			}

		};

	}() );

	this.checkDistances = function () {

		if ( ! _this.noZoom || ! _this.noPan ) {

			if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

				_this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );
				_zoomStart.copy( _zoomEnd );

			}

			if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

				_this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );
				_zoomStart.copy( _zoomEnd );

			}

		}

	};

	this.update = function () {

		_eye.subVectors( _this.object.position, _this.target );

		if ( ! _this.noRotate ) {

			_this.rotateCamera();

		}

		if ( ! _this.noZoom ) {

			_this.zoomCamera();

		}

		if ( ! _this.noPan ) {

			_this.panCamera();

		}

		_this.object.position.addVectors( _this.target, _eye );

		_this.checkDistances();

		_this.object.lookAt( _this.target );

		if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

			_this.dispatchEvent( changeEvent );

			lastPosition.copy( _this.object.position );

		}

	};

	this.reset = function () {

		_state = STATE.NONE;
		_prevState = STATE.NONE;

		_this.target.copy( _this.target0 );
		_this.object.position.copy( _this.position0 );
		_this.object.up.copy( _this.up0 );

		_eye.subVectors( _this.object.position, _this.target );

		_this.object.lookAt( _this.target );

		_this.dispatchEvent( changeEvent );

		lastPosition.copy( _this.object.position );

	};

	// helpers

	/**
	 * Checks if the pressed key is any of the configured modifier keys for
	 * a specified behavior.
	 *
	 * @param {number | number[]} keys
	 * @param {number} key
	 *
	 * @returns {boolean} `true` if `keys` contains or equals `key`
	 */
	function containsKey(keys, key) {
		if (Array.isArray(keys)) {
			return keys.indexOf(key) !== -1;
		} else {
			return keys === key;
		}
	}

	// listeners

	function keydown( event ) {

		if ( _this.enabled === false ) return;

		window.removeEventListener( 'keydown', keydown );

		_prevState = _state;

		if ( _state !== STATE.NONE ) {

			return;

		} else if ( containsKey( _this.keys[ STATE.ROTATE ], event.keyCode ) && ! _this.noRotate ) {

			_state = STATE.ROTATE;

		} else if ( containsKey( _this.keys[ STATE.ZOOM ], event.keyCode ) && ! _this.noZoom ) {

			_state = STATE.ZOOM;

		} else if ( containsKey( _this.keys[ STATE.PAN ], event.keyCode ) && ! _this.noPan ) {

			_state = STATE.PAN;

		}

	}

	function keyup( event ) {

		if ( _this.enabled === false ) return;

		_state = _prevState;

		window.addEventListener( 'keydown', keydown, false );

	}

	function mousedown( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.NONE ) {

			_state = event.button;

		}

		if ( _state === STATE.ROTATE && ! _this.noRotate ) {

			_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
			_movePrev.copy( _moveCurr );

		} else if ( _state === STATE.ZOOM && ! _this.noZoom ) {

			_zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
			_zoomEnd.copy( _zoomStart );

		} else if ( _state === STATE.PAN && ! _this.noPan ) {

			_panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
			_panEnd.copy( _panStart );

		}

		document.addEventListener( 'mousemove', mousemove, false );
		document.addEventListener( 'mouseup', mouseup, false );

		_this.dispatchEvent( startEvent );

	}

	function mousemove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.ROTATE && ! _this.noRotate ) {

			_movePrev.copy( _moveCurr );
			_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );

		} else if ( _state === STATE.ZOOM && ! _this.noZoom ) {

			_zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

		} else if ( _state === STATE.PAN && ! _this.noPan ) {

			_panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

		}

	}

	function mouseup( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		_state = STATE.NONE;

		document.removeEventListener( 'mousemove', mousemove );
		document.removeEventListener( 'mouseup', mouseup );
		_this.dispatchEvent( endEvent );

	}

	function mousewheel( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.deltaMode ) {

			case 2:
				// Zoom in pages
				_zoomStart.y -= event.deltaY * 0.025;
				break;

			case 1:
				// Zoom in lines
				_zoomStart.y -= event.deltaY * 0.01;
				break;

			default:
				// undefined, 0, assume pixels
				_zoomStart.y -= event.deltaY * 0.00025;
				break;

		}

		_this.dispatchEvent( startEvent );
		_this.dispatchEvent( endEvent );

	}

	function touchstart( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				_state = STATE.TOUCH_ROTATE;
				_moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				_movePrev.copy( _moveCurr );
				break;

			default: // 2 or more
				_state = STATE.TOUCH_ZOOM_PAN;
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

				var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
				var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
				_panStart.copy( getMouseOnScreen( x, y ) );
				_panEnd.copy( _panStart );
				break;

		}

		_this.dispatchEvent( startEvent );

	}

	function touchmove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1:
				_movePrev.copy( _moveCurr );
				_moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				break;

			default: // 2 or more
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

				var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
				var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
				_panEnd.copy( getMouseOnScreen( x, y ) );
				break;

		}

	}

	function touchend( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

			case 0:
				_state = STATE.NONE;
				break;

			case 1:
				_state = STATE.TOUCH_ROTATE;
				_moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				_movePrev.copy( _moveCurr );
				break;

		}

		_this.dispatchEvent( endEvent );

	}

	function contextmenu( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();

	}

	this.dispose = function() {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', mousedown, false );
		this.domElement.removeEventListener( 'wheel', mousewheel, false );

		this.domElement.removeEventListener( 'touchstart', touchstart, false );
		this.domElement.removeEventListener( 'touchend', touchend, false );
		this.domElement.removeEventListener( 'touchmove', touchmove, false );

		document.removeEventListener( 'mousemove', mousemove, false );
		document.removeEventListener( 'mouseup', mouseup, false );

		window.removeEventListener( 'keydown', keydown, false );
		window.removeEventListener( 'keyup', keyup, false );

	};

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	this.domElement.addEventListener( 'mousedown', mousedown, false );
	this.domElement.addEventListener( 'wheel', mousewheel, false );

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', keydown, false );
	window.addEventListener( 'keyup', keyup, false );

	this.handleResize();

	// force an update at start
	this.update();

};

TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );


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

		//let typing_timer;
		let doneTypingTime = 200;                                                       // Specify the time (in ms) to wait before the user is done typing
		//test
		/* Sphinx Search */
		if(e.type == 'keyup'){

			console.log("Keydown");

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
// function sleep (time) {
// 	return new Promise((resolve) => setTimeout(resolve, time));
// }



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

// From example code (vanilla af)
	const elem = document.getElementById('3d-graph');
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	elem.appendChild(renderer.domElement);
	elem.appendChild(v.nav_info = document.createElement('div'));
	v.nav_info.className = 'graph-nav-info';
	v.nav_info.textContent = "Left-click: Rotate, Right-click: Pan, Scroll: Zoom";
	elem.appendChild(v.infoElem = document.createElement('div'));
	v.infoElem.className = 'graph-info-msg';
	v.infoElem.textContent = 'initial message';

	const Graph = new ThreeForceGraph(elem)
		.linkWidth(0.5)
		.onNodeClick(colorNode)
		.graphData(jsonResponse);
	// Setup renderer


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
	camera.position.z = Math.cbrt(jsonResponse.nodes.length) * 100;

	// Add camera controls
	const tbControls = new TrackballControls(camera, renderer.domElement);
	tbControls.dynamicDampingFactor = 0.6;
	tbControls.minDistance = 0.1;
	tbControls.maxDistance = 20000;

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
			console.log('animate running');
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
	offlineRequest();
}
wikimap();