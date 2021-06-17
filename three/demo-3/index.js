import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

var container, stats;

var camera, scene, renderer, geometry;
var endPositions = [];
var positions = [];

var points;
var direction = 1;
var particles = [];
var numParticles = 8000;

var ct = 0;

var canvas = document.querySelector("#canvas");

var controls;

var wrap = gsap.utils.wrapYoyo(0, 1);

init();
var lastTime = Date.now();
var startTime = lastTime;
animate();

function init() {
	container = document.getElementById("container");
	container = document.body;

  //

  camera = new THREE.PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    5,
    3500
  );
  camera.position.z = 2750;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.Fog(0x050505, 2000, 3500);

	//
	
	controls = new OrbitControls( camera, canvas );

  

  geometry = new THREE.BufferGeometry();

  // var positions = [];
  var colors = [];

  var color = new THREE.Color();

  var n = 1000,
    n2 = n / 2; // particles spread in the cube

  for (var i = 0; i < numParticles; i++) {
    // positions

    var xIndex = Math.random() * n - n2;
    var yIndex = Math.random() * n - n2;
    var zIndex = Math.random() * n - n2;

		// positions.push(x, y, z);
		positions.push(0,0,0);
		endPositions.push(xIndex, yIndex, zIndex);

    // colors

    var vx = xIndex / n + 0.5;
    var vy = yIndex / n + 0.5;
    var vz = zIndex / n + 0.5;

    color.setRGB(vx, vy, vz);

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  geometry.computeBoundingSphere();

  //

  var material = new THREE.PointsMaterial({ 
		size: 20, 
		vertexColors: true 
	});

  points = new THREE.Points(geometry, material);
  scene.add(points);

	console.log("GEOM", geometry)

	var target = geometry.attributes.position.array;
	var tl = gsap.timeline()
	var duration = gsap.utils.random(1, 2, true);
	var delay = gsap.utils.random(0, 5, true);

	console.time("GSAP")
	for (var i = 0; i < target.length; i++) {

		var offset = i * 3;

		var xIndex = offset;
		var yIndex = offset + 1;
		var zIndex = offset + 2;

		// gsap.to(target, {
		// 	[xIndex]: endPositions[xIndex],
		// 	[yIndex]: endPositions[yIndex],
		// 	[zIndex]: endPositions[zIndex],
		// 	duration: 1,
		// 	ease: "none",
		// 	delay
		// });

		gsap.to({ x: 0 }, {
			delay,
			duration,
			x: 1000
		})
	}

	// gsap.to(target, {
	// 	endArray: endPositions,
	// 	duration: 5,
	// 	repeat: -1,
	// 	yoyo: true
	// })

	console.timeEnd("GSAP")

	for (var i = 0; i < target.length; i++) {

		var offset = i * 3;

		var xIndex = offset;
		var yIndex = offset + 1;
		var zIndex = offset + 2;

		var x = positions[xIndex];
		var y = positions[yIndex];
		var z = positions[zIndex];

		var dx = endPositions[xIndex] - x;
		var dy = endPositions[yIndex] - y;
		var dz = endPositions[zIndex] - z;		

		var friction = gsap.utils.random(0.5, 0.99)
		friction = 1;

		var particle = {
			xIndex, yIndex, zIndex, dx, dy, dz, x, y, z, friction
		};

		particles.push(particle);
	}

  renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
		// powerPreference: "high-per"
	});

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // container.appendChild(renderer.domElement);

  //

  stats = new Stats();
  container.appendChild(stats.dom);

  //

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  requestAnimationFrame(animate);

	stats.update();
	controls.update();
  render();
}

function render() {

	// var time = Date.now() * 0.001;
	var time = Date.now();

	// var elapsed = time - lastTime;
	// var progress = (time - startTime) / 5000;

	var progress = wrap((time - startTime) / 5000)
	
	// if (ct++ < 10000) {
	// 	// console.log("PROGRES", progress)
	// 	// console.log(time - startTime, progress)
	// }

	var target = geometry.attributes.position.array;
	
	for (var i = 0; i < numParticles; i++) {

		var p = particles[i];

		target[p.xIndex] = (p.x + p.dx * progress) * p.friction;
		target[p.yIndex] = (p.y + p.dy * progress) * p.friction;
		target[p.zIndex] = (p.z + p.dz * progress) * p.friction;
	}
	
	
	geometry.attributes.position.needsUpdate = true;

  // points.rotation.x = time * 0.25;
  // points.rotation.y = time * 0.5;

  renderer.render(scene, camera);
}
