
const vert = `
  precision highp float;

  uniform float sineTime;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  attribute vec3 position;
  attribute vec3 offset;
  attribute vec4 color;
  attribute vec4 orientationStart;
  attribute vec4 orientationEnd;

  varying vec3 vPosition;
  varying vec4 vColor;

  void main(){

    vPosition = offset * max( abs( sineTime * 2.0 + 1.0 ), 0.5 ) + position;
    vec4 orientation = normalize( mix( orientationStart, orientationEnd, sineTime ) );
    vec3 vcV = cross( orientation.xyz, vPosition );
    vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );

    // float a = float(sin(sineTime));
    // vColor = vec4(color) * vec4(1.0, 1.0, 1.0, sin(sineTime * 50.0));
    vColor = color;

    // vec3 vPosition1 = orientationStart.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
    // vPosition = offset + position;
    // orientation.w = 1.0;
    // gl_Position = projectionMatrix * modelViewMatrix * orientation;

    // vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

		// gl_PointSize = 100.0 * ( 300.0 / -mvPosition.z );

		// gl_Position = projectionMatrix * mvPosition* vec4(vPosition, 1.0);
  }
`;

const frag = `
  precision highp float;

  uniform float time;

  varying vec3 vPosition;
  varying vec4 vColor;

  void main() {

    vec4 color = vec4( vColor );
    color.r += sin( vPosition.x * 10.0 + time ) * 0.5;

    gl_FragColor = color;
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;

var positions = [];
			var offsets = [];
			var colors = [];
			var orientationsStart = [];
      var orientationsEnd = [];
      var mesh;

var container, stats;

		var camera, scene, renderer;

		init();
		animate();

		function init() {

			// container = document.getElementById( 'container' );

			camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10 );
			camera.position.z = 2;

			scene = new THREE.Scene();

			// geometry

			var vector = new THREE.Vector4();

			var instances = 150000;

			// var positions = [];
			// var offsets = [];
			// var colors = [];
			// var orientationsStart = [];
			// var orientationsEnd = [];

			positions.push( 0.025, - 0.025, 0 );
			positions.push( - 0.025, 0.025, 0 );
			positions.push( 0, 0, 0.025 );

			// instanced attributes

			for ( var i = 0; i < instances; i ++ ) {

				// offsets

				offsets.push( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );

				// colors

				colors.push( Math.random(), Math.random(), Math.random(), Math.random() );

				// orientation start

				vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
				vector.normalize();

				orientationsStart.push( vector.x, vector.y, vector.z, vector.w );

				// orientation end

				vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
				vector.normalize();

				orientationsEnd.push( vector.x, vector.y, vector.z, vector.w );

			}

			var geometry = new THREE.InstancedBufferGeometry();
			geometry.instanceCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise

			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

			geometry.setAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );
			geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array( colors ), 4 ) );
			geometry.setAttribute( 'orientationStart', new THREE.InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );
			// geometry.setAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationsEnd ), 4 ) );
			geometry.setAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );

			// material

			var material = new THREE.RawShaderMaterial( {

				uniforms: {
					"time": { value: 1.0 },
					"sineTime": { value: 1.0 }
				},
				// vertexShader: document.getElementById( 'vertexShader' ).textContent,
        // fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        
        vertexShader: vert,
				fragmentShader: frag,
				side: THREE.DoubleSide,
				transparent: true

			} );

			//

			mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );
      
      console.log("MESH", mesh)

      gsap.to(mesh.geometry.attributes.orientationEnd.array, {
        endArray: orientationsEnd,
        duration: 10
      })

			//

			renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#canvas"),
        antialias: true
      });
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
			// container.appendChild( renderer.domElement );

			if ( renderer.capabilities.isWebGL2 === false && renderer.extensions.get( 'ANGLE_instanced_arrays' ) === null ) {

				document.getElementById( 'notSupported' ).style.display = '';
				return;

			}

			//

			var gui = new dat.GUI( { width: 350 } );
			gui.add( geometry, 'instanceCount', 0, instances );

			//

			stats = new Stats();
			document.body.appendChild( stats.dom );

			//

			window.addEventListener( 'resize', onWindowResize, false );

		}

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

		//

		function animate() {

			requestAnimationFrame( animate );

			render();
			stats.update();

		}

		function render() {

			var time = performance.now();

			var object = scene.children[ 0 ];

			// object.rotation.y = time * 0.0005;
			object.material.uniforms[ "time" ].value = time * 0.005;
			object.material.uniforms[ "sineTime" ].value = Math.sin( object.material.uniforms[ "time" ].value * 0.05 );

      mesh.geometry.attributes.orientationEnd.needsUpdate = true;

			renderer.render( scene, camera );

		}
