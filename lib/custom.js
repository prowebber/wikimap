// /lib/custom.js
// import v from  './globals.js';
/* JS Library for common functions */

// var v = {
// 	'animate': null,
// 	'auto_orbit': true,
// 	'default_json': '{"results":{"nodes":[{"id":"308","name":"Aristotle","color":16777215},{"id":199503,"name":"Bibliothu00e8que nationale de France","color":255},{"id":1130,"name":"Avicenna","color":255},{"id":4163,"name":"Bertrand Russell","color":255},{"id":2030,"name":"Augustine of Hippo","color":255},{"id":3198808,"name":"Biblioteca Nacional de Espau00f1a","color":255},{"id":3354,"name":"Berlin","color":255},{"id":5407,"name":"California","color":255},{"id":3343,"name":"Belgium","color":255},{"id":47836,"name":"Averroes","color":255},{"id":2171,"name":"Anti-realism","color":255},{"id":146607,"name":"Al-Ghazali","color":255},{"id":3408,"name":"Baruch Spinoza","color":255},{"id":4552,"name":"Bernard of Clairvaux","color":255},{"id":3225,"name":"Athanasius of Alexandria","color":255},{"id":1370,"name":"Ambrose","color":255},{"id":1573,"name":"Albertus Magnus","color":255},{"id":914,"name":"Author","color":255},{"id":18951905,"name":"Argentina","color":255},{"id":3383,"name":"Brazil","color":255},{"id":844,"name":"Amsterdam","color":255},{"id":624,"name":"Alaska","color":255},{"id":303,"name":"Alabama","color":255},{"id":3392,"name":"British Columbia","color":255},{"id":4689264,"name":"Australia","color":255},{"id":5042916,"name":"Canada","color":255},{"id":3415,"name":"Bulgaria","color":255},{"id":26964606,"name":"Austria","color":255},{"id":12,"name":"Anarchism","color":255},{"id":272065,"name":"Al-Kindi","color":255},{"id":175040,"name":"Al-Farabi","color":255},{"id":700,"name":"Arthur Schopenhauer","color":255},{"id":4041,"name":"Bede","color":255},{"id":1203,"name":"Alternate history","color":255},{"id":1837,"name":"Allegory","color":255},{"id":10568,"name":"Association football","color":255},{"id":3708,"name":"Brussels","color":255},{"id":1930,"name":"Arkansas","color":255},{"id":85427,"name":"Birmingham, Alabama","color":255},{"id":863,"name":"American Civil War","color":255},{"id":717,"name":"Alberta","color":255},{"id":3457,"name":"Belarus","color":255},{"id":44443,"name":"Anti-capitalism","color":255},{"id":49938,"name":"Anarcho-syndicalism","color":255},{"id":1023,"name":"Anarcho-capitalism","color":255},{"id":152737,"name":"Buenaventura Durruti","color":255},{"id":271975,"name":"Al-Biruni","color":255},{"id":3143,"name":"Axiology","color":255},{"id":65308,"name":"Apocalyptic and post-apocalyptic fiction","color":255},{"id":81803,"name":"Alien invasion","color":255},{"id":313204,"name":"Arthur C. Clarke Award","color":255},{"id":185068,"name":"Antihero","color":255},{"id":200962,"name":"Backstory","color":255},{"id":3921,"name":"Basketball","color":255},{"id":3850,"name":"Baseball","color":255},{"id":715249,"name":"Asian Football Confederation","color":255},{"id":3138,"name":"Atlanta","color":255},{"id":104844,"name":"Auburn, Alabama","color":255},{"id":37653,"name":"CBS","color":255},{"id":307,"name":"Abraham Lincoln","color":255},{"id":4849,"name":"Battle of Gettysburg","color":255},{"id":771,"name":"American Revolutionary War","color":255},{"id":15895358,"name":"Calgary","color":255},{"id":223485,"name":"Camrose, Alberta","color":255},{"id":746,"name":"Azerbaijan","color":255},{"id":420350,"name":"Alexander Berkman","color":255},{"id":867979,"name":"Anti-authoritarianism","color":255},{"id":1189485,"name":"Abu al-Wafa\' Buzjani","color":255},{"id":1589482,"name":"Abu-Mahmud Khojandi","color":255},{"id":2130,"name":"Aesthetics","color":255}],"links":[{"source":"308","target":199503,"val":0.004475159430856937,"color":65535},{"source":"308","target":1130,"val":0.09576502732240437,"color":65535},{"source":"308","target":4163,"val":0.09044702202528346,"color":65535},{"source":"308","target":2030,"val":0.07340766088972293,"color":65535},{"source":199503,"target":3198808,"val":0.04477854530678586,"color":65535},{"source":199503,"target":3354,"val":0.024116009280742458,"color":65535},{"source":199503,"target":5407,"val":0.015341764528756399,"color":65535},{"source":199503,"target":3343,"val":0.011886227308291118,"color":65535},{"source":1130,"target":47836,"val":0.2197334845477743,"color":65535},{"source":1130,"target":2171,"val":0.18929321203638907,"color":65535},{"source":1130,"target":146607,"val":0.15083281924737815,"color":65535},{"source":4163,"target":3408,"val":0.15773889636608346,"color":65535},{"source":4163,"target":2030,"val":0.07987421383647798,"color":65535},{"source":4163,"target":1130,"val":0.10344081367669336,"color":65535},{"source":2030,"target":4552,"val":0.22637931034482758,"color":65535},{"source":2030,"target":3225,"val":0.21776359973136333,"color":65535},{"source":2030,"target":1370,"val":0.2283894449499545,"color":65535},{"source":2030,"target":1573,"val":0.21527001862197392,"color":65535},{"source":3198808,"target":3354,"val":0.005378341560072891,"color":65535},{"source":3198808,"target":914,"val":0.004415137614678899,"color":65535},{"source":3198808,"target":18951905,"val":0.0014883958282391214,"color":65535},{"source":3354,"target":3343,"val":0.02711047368630732,"color":65535},{"source":3354,"target":3383,"val":0.01506489202238643,"color":65535},{"source":3354,"target":844,"val":0.039770735830773354,"color":65535},{"source":5407,"target":624,"val":0.03192096365173288,"color":65535},{"source":5407,"target":303,"val":0.027754677754677756,"color":65535},{"source":5407,"target":3392,"val":0.02456140350877193,"color":65535},{"source":3343,"target":4689264,"val":0.07517138599105812,"color":65535},{"source":3343,"target":5042916,"val":0.05829663198655348,"color":65535},{"source":3343,"target":3415,"val":0.10956736166062457,"color":65535},{"source":3343,"target":26964606,"val":0.07055785655957802,"color":65535},{"source":47836,"target":308,"val":0.08800729594163247,"color":65535},{"source":47836,"target":4163,"val":0.12061855670103093,"color":65535},{"source":47836,"target":2030,"val":0.07216103304215724,"color":65535},{"source":2171,"target":4163,"val":0.13734039240112114,"color":65535},{"source":2171,"target":308,"val":0.07360406091370558,"color":65535},{"source":2171,"target":12,"val":0.09489916963226572,"color":65535},{"source":146607,"target":272065,"val":0.16016640665626625,"color":65535},{"source":146607,"target":47836,"val":0.11075569772091164,"color":65535},{"source":146607,"target":175040,"val":0.1682360326428123,"color":65535},{"source":3408,"target":2030,"val":0.11429131542834739,"color":65535},{"source":3408,"target":308,"val":0.08637355784222014,"color":65535},{"source":3408,"target":700,"val":0.14478764478764478,"color":65535},{"source":4552,"target":3225,"val":0.33042394014962595,"color":65535},{"source":4552,"target":1370,"val":0.3045928430543815,"color":65535},{"source":4552,"target":4041,"val":0.2552884615384615,"color":65535},{"source":3225,"target":1370,"val":0.29095816464237517,"color":65535},{"source":3225,"target":4041,"val":0.24189063948100092,"color":65535},{"source":1370,"target":4041,"val":0.27341115434500646,"color":65535},{"source":1573,"target":1370,"val":0.3376082077588971,"color":65535},{"source":1573,"target":4552,"val":0.30315420560747663,"color":65535},{"source":1573,"target":4041,"val":0.2766756032171582,"color":65535},{"source":914,"target":199503,"val":0.010079594752833274,"color":65535},{"source":914,"target":1203,"val":0.014658123409110858,"color":65535},{"source":914,"target":1837,"val":0.014177527298344487,"color":65535},{"source":18951905,"target":3383,"val":0.09423536527361022,"color":65535},{"source":18951905,"target":4689264,"val":0.0518833095617,"color":65535},{"source":18951905,"target":5042916,"val":0.03973154819407857,"color":65535},{"source":18951905,"target":3343,"val":0.06401966043699527,"color":65535},{"source":3383,"target":4689264,"val":0.07100586990376552,"color":65535},{"source":3383,"target":5042916,"val":0.058385697187312985,"color":65535},{"source":3383,"target":10568,"val":0.035451952150357936,"color":65535},{"source":844,"target":3343,"val":0.026815694384737826,"color":65535},{"source":844,"target":199503,"val":0.009589143240623368,"color":65535},{"source":844,"target":3708,"val":0.05772669220945083,"color":65535},{"source":624,"target":3392,"val":0.03536086213149578,"color":65535},{"source":624,"target":303,"val":0.04558280876926416,"color":65535},{"source":624,"target":1930,"val":0.048556588960019326,"color":65535},{"source":303,"target":1930,"val":0.10819411296738266,"color":65535},{"source":303,"target":85427,"val":0.08848629320619786,"color":65535},{"source":303,"target":863,"val":0.03142064846416382,"color":65535},{"source":3392,"target":5042916,"val":0.048611292351537994,"color":65535},{"source":3392,"target":717,"val":0.10937825392785247,"color":65535},{"source":4689264,"target":5042916,"val":0.07826473295039828,"color":65535},{"source":3415,"target":3383,"val":0.06366414486978594,"color":65535},{"source":3415,"target":3457,"val":0.11654874213836477,"color":65535},{"source":3415,"target":4689264,"val":0.0399338937532775,"color":65535},{"source":26964606,"target":4689264,"val":0.03819733748079024,"color":65535},{"source":26964606,"target":5042916,"val":0.03157542302310208,"color":65535},{"source":26964606,"target":3415,"val":0.05374942565381694,"color":65535},{"source":12,"target":44443,"val":0.17692629815745395,"color":65535},{"source":12,"target":49938,"val":0.174592690444738,"color":65535},{"source":12,"target":1023,"val":0.16959192628345765,"color":65535},{"source":12,"target":152737,"val":0.15762394761459309,"color":65535},{"source":272065,"target":1130,"val":0.14649033570701933,"color":65535},{"source":272065,"target":271975,"val":0.20773638968481375,"color":65535},{"source":272065,"target":47836,"val":0.13043478260869565,"color":65535},{"source":175040,"target":1130,"val":0.1298205421916762,"color":65535},{"source":175040,"target":272065,"val":0.15846153846153846,"color":65535},{"source":175040,"target":47836,"val":0.10436634717784878,"color":65535},{"source":700,"target":308,"val":0.06658521686010996,"color":65535},{"source":700,"target":199503,"val":0.0020761096401589706,"color":65535},{"source":700,"target":3143,"val":0.18317853457172342,"color":65535},{"source":4041,"target":2030,"val":0.17998689813298396,"color":65535},{"source":1203,"target":65308,"val":0.0893854748603352,"color":65535},{"source":1203,"target":81803,"val":0.09976580796252928,"color":65535},{"source":1203,"target":1837,"val":0.06162026900218955,"color":65535},{"source":1203,"target":313204,"val":0.08570097810898929,"color":65535},{"source":1837,"target":185068,"val":0.04804928131416838,"color":65535},{"source":1837,"target":200962,"val":0.05446293494704992,"color":65535},{"source":10568,"target":3921,"val":0.032905593079627336,"color":65535},{"source":10568,"target":3850,"val":0.02726796890660846,"color":65535},{"source":10568,"target":715249,"val":0.02733122875182127,"color":65535},{"source":3708,"target":3343,"val":0.07912666274137538,"color":65535},{"source":3708,"target":3354,"val":0.040827948746030004,"color":65535},{"source":3708,"target":3383,"val":0.011620059527929674,"color":65535},{"source":1930,"target":5407,"val":0.026114888377322128,"color":65535},{"source":1930,"target":863,"val":0.023936471922858762,"color":65535},{"source":85427,"target":3138,"val":0.04816798800085708,"color":65535},{"source":85427,"target":104844,"val":0.05516980179270294,"color":65535},{"source":85427,"target":37653,"val":0.010418062441377463,"color":65535},{"source":863,"target":307,"val":0.09043734251428286,"color":65535},{"source":863,"target":4849,"val":0.06237065992182111,"color":65535},{"source":863,"target":771,"val":0.04978013574228085,"color":65535},{"source":863,"target":5407,"val":0.014278438328737772,"color":65535},{"source":717,"target":5042916,"val":0.04179097976872319,"color":65535},{"source":717,"target":15895358,"val":0.09040057063483126,"color":65535},{"source":717,"target":223485,"val":0.06511431882836372,"color":65535},{"source":3457,"target":3343,"val":0.09039944672646492,"color":65535},{"source":3457,"target":26964606,"val":0.05016435921321726,"color":65535},{"source":3457,"target":746,"val":0.0954355100065237,"color":65535},{"source":44443,"target":49938,"val":0.2628424657534247,"color":65535},{"source":44443,"target":1023,"val":0.23299319727891157,"color":65535},{"source":44443,"target":152737,"val":0.2594202898550725,"color":65535},{"source":49938,"target":152737,"val":0.2935729847494553,"color":65535},{"source":49938,"target":1023,"val":0.24834749763928235,"color":65535},{"source":1023,"target":152737,"val":0.3255939524838013,"color":65535},{"source":1023,"target":420350,"val":0.2882414151925078,"color":65535},{"source":152737,"target":420350,"val":0.36585365853658536,"color":65535},{"source":152737,"target":867979,"val":0.31654264453348596,"color":65535},{"source":271975,"target":1130,"val":0.12670349907918968,"color":65535},{"source":271975,"target":1189485,"val":0.2022332506203474,"color":65535},{"source":271975,"target":1589482,"val":0.19706242350061198,"color":65535},{"source":3143,"target":308,"val":0.055015619576535925,"color":65535},{"source":3143,"target":2130,"val":0.09229747675962816,"color":65535},{"source":3143,"target":3408,"val":0.15077605321507762,"color":65535}]},"execution_time":2.1330270767211914,"target_page_id":"308","target_page_title":"Aristotle","converted_node":"Fghsdfgh","max_shared_links":0.36585365853658536,"min_shared_links":0.0014883958282391214}',
// 	'frame_id': null,
// 	'freeze_graph': null,
// 	'isRotating': false,
// 	'list_props': function list_props(obj) {
// 		console.log(JSON.stringify(Object.entries(obj)));
// 	},
// 	'local_data': false,
// 	'max_shared_links': 1,
// 	'min_shared_links': null,
// 	'nav_info': null,
// 	'show_GCS_triad': false,
// 	'strength_scale': 3,
// 	'tb_state': null
// };

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