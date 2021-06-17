import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";

const vertex = `
	attribute vec4 color;
	varying vec2 vUv;
	varying vec4 vColor;
	varying vec3 vPosition;
  
  void main() {
		vUv = uv;
		vColor = color;
		vPosition = position;

    mat4 modelViewProjectionMatrix = projectionMatrix * modelViewMatrix;
  
    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);
  }
`;

const fragment = `

	varying vec2 vUv;
	varying vec4 vColor;
	varying vec3 vPosition;
		
	void main() {
		vec3 position = vec3(vPosition);
		vec4 color = vec4(vColor);
		gl_FragColor = vec4(vColor);
	}
`;

class Application {

	constructor(settings) {

		Object.assign(this, {
			canvas: document.querySelector("#canvas"),
			perspective: 1000
		}, settings);

		this.addRenderer();
		this.resize();		
		this.addEvents();		
		this.createParticles();
		this.start();
	}

	createParticles() {


		// var geometry = new THREE.PlaneBufferGeometry(200, 200, 1);
		// var material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
		// var plane = new THREE.Mesh( geometry, material );
		// this.scene.add(plane);

		this.uniforms = {		
			time: { value: 1.0 },
			resolution: { value: new THREE.Vector2() }	
		};

		var material = new THREE.ShaderMaterial({

			uniforms: this.uniforms,		
			vertexShader: vertex,		
			fragmentShader: fragment,
			// side: THREE.DoubleSide
			side: THREE.DoubleSide,
			transparent: true
		});

		var geometry = new THREE.BufferGeometry();
		// var geometry = new THREE.PlaneBufferGeometry(200, 200, 1);
		// var geometry = new THREE.PlaneBufferGeometry(1, 1, 1);
		// create a simple square shape. We duplicate the top left and bottom right
		// vertices because each vertex needs to appear once per triangle.
		var vertices = new Float32Array([
			-1.0, -1.0,  1.0,
			1.0, -1.0,  1.0,
			1.0,  1.0,  1.0,

			1.0,  1.0,  1.0,
			-1.0,  1.0,  1.0,
			-1.0, -1.0,  1.0
		]);

		var vertices = new Float32Array([
			-1000.0, -1000.0,  1000.0,
			1000.0, -1000.0,  1000.0,
			1000.0,  1000.0,  1000.0,

			1000.0,  1000.0,  1000.0,
			-1000.0,  1000.0,  1000.0,
			-1000.0, -1000.0,  1000.0
		]);

		var positions = [];
		var colors = [];

		var size = 30;

		var endPositions = [];

		for ( var i = 0; i < 10 * 3; i ++ ) {

			// adding x,y,z
			positions.push((Math.random() * size) - size / 2);
			positions.push((Math.random() * size) - size / 2);
			positions.push((Math.random() * size) - size / 2);
			// positions.push(0,0,0);

			endPositions.push((Math.random() * size) - size / 2);
			endPositions.push((Math.random() * size) - size / 2);
			endPositions.push((Math.random() * size) - size / 2);



			// positions.push( (Math.random() - 0.5) * scale );
			// positions.push( Math.random() - 0.5 );
			// positions.push( Math.random() - 0.5 );

			// adding r,g,b,a
			colors.push( Math.random() * 255 );
			colors.push( Math.random() * 255 );
			colors.push( Math.random() * 255 );
			colors.push( Math.random() * 255 );

		}

		// itemSize = 3 because there are 3 values (components) per vertex
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
		geometry.setAttribute("color", new THREE.Uint8BufferAttribute(colors, 4));

		geometry.attributes.color.normalized = true;
		this.geometry = geometry;

		console.log("GEOM", geometry)

		gsap.to(geometry.attributes.position.array, {
			endArray: endPositions,
			duration: 10,
			yoyo: true,
			repeat: -1
		});

		

		// geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
		// var material = new THREE.MeshBasicMaterial({ 
		// 	color: 0xff0000 
		// });

		var mesh = new THREE.Mesh(geometry, material);
		// var mesh = new THREE.MeshBasicMaterial(geometry, material);


		gsap.to(mesh.rotation, {
			x: Math.PI * 2,
			y: Math.PI * 2,
			z: Math.PI * 2,
			duration: 20,
			ease: "none",
			repeat: -1
		})

		this.scene.add(mesh);

		console.log("MATERIAL", material)
		console.log("MESH", mesh)
		console.log("PROGRAM", material.vertexShader)

		this.renderer.compile(this.scene, this.camera);

		// Get the GL context:
		const gl = this.renderer.getContext();

		// Print the shader source!
		console.log(  
			// gl.getShaderSource(material.program.fragmentShader)
		);

		material.onBeforeCompile = shader => {
			console.log("SHADER", shader)
		}
	}

	start() {
		gsap.ticker.add(this.render);
	}

	addEvents() {
		window.addEventListener("resize", this.resize);
	}

	addRenderer() {

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			canvas: this.canvas
		});

		this.camera = new THREE.PerspectiveCamera()
  	// this.camera.position.set(0, 0, 1);
  	this.camera.position.set(0, 0, this.perspective);
		this.camera.far = this.perspective ** 2;
		
		this.scene = new THREE.Scene();

		this.controls = new OrbitControls(this.camera, this.canvas);

		this.stats = new Stats();
  	document.body.appendChild(this.stats.dom);

		this.screen = {
			width: window.innerWidth,
			height: window.innerHeight,
			get cx() {
				return this.width / 2;
			},
			get cy() {
				return this.height / 2;
			}
		};
	}

	resize = () => {

		const width = this.screen.width = this.canvas.clientWidth;
		const height = this.screen.height = this.canvas.clientHeight;

		const fov = (180 * (2 * Math.atan(height / 2 / this.perspective))) / Math.PI;
		this.renderer.setSize(width, height);
		this.camera.fov = fov;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		// const dist  = this.camera.position.z;
    // const height = 1;
    // this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));
	}

	render = () => {

		this.stats.update();
		this.controls.update();

		this.geometry.attributes.position.needsUpdate = true;

		this.renderer.render(this.scene, this.camera);
	}

	mapCoords(v) {

		v.x = -(this.screen.cx - v.x);
		v.y = this.screen.cy - v.y;

		return v;
	}
}

new Application();
