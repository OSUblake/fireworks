import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";

const vertex = `


#define PHONG

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

	attribute vec4 color;

	varying vec2 vUv;
	varying vec4 vColor;
	varying vec3 vPosition;
  
  void main() {
		vUv = uv;
		vColor = color;
		vPosition = position;

		// transformed += 0.0;

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
		this.createLights();
		this.createParticles2();
		this.addEvents();		
		this.start();
	}

	createParticles2() {

		var numParticles = 10;

		var texture = new THREE.TextureLoader().load("../../particle-pack/PNG_Transparent/circle_05.png");
		var geometry = new THREE.PlaneBufferGeometry(200, 200, 0);



		// var material = new THREE.ShaderMaterial({
		// var material = new THREE.MeshStandardMaterial({
		// var material = new THREE.MeshLambertMaterial({
		// var material = new THREE.MeshPhongMaterial({
		var material = new THREE.MeshPhysicalMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			// vertexShader: vertex,		
			// fragmentShader: fragment,
			// map: texture,
			color: 0xff0000,
			// color: 0x303030,
			// blending: THREE.AdditiveBlending
		});

		// material.clearcoat = 0;
		// material.roughness = 0;

		var mesh = new THREE.Mesh(geometry, material);

		this.scene.add(mesh);

		gsap.to(mesh.rotation, {
			duration: 10,
			repeat: -1,
			ease: "none",
			x: Math.PI * 2,
			y: Math.PI * 2,
			z: Math.PI * 2,
		})

		console.log("TEXTURE", texture);
		console.log("MATERIAL", material)
		console.log("GEOM", geometry);
		console.log("MESH", mesh)
		console.log("RENDERER", this.renderer)
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

		var size = 300;

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

	createLights() {

		var light = new THREE.AmbientLight( 0xffffff, 0.5 ); 
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );

		// light.position.z = 100;
		directionalLight.position.x = -500;
		directionalLight.position.y = -500;
		directionalLight.position.z = 1000;

		this.scene.add(light, directionalLight);
		// this.scene.add(light);
		// this.scene.add(directionalLight);
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

		// this.geometry.attributes.position.needsUpdate = true;

		this.renderer.render(this.scene, this.camera);

		// console.log("RENDERER", this.renderer.info.render.calls)
	}

	mapCoords(v) {

		v.x = -(this.screen.cx - v.x);
		v.y = this.screen.cy - v.y;

		return v;
	}
}

new Application();
