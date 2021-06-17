var mesh, renderer, scene, camera, controls, mesh;
var perspective = 5000;
var element = document.querySelector("#element");
var canvas = document.querySelector("#canvas");

var stats = new Stats();
document.body.appendChild(stats.dom);

var ct = 0;

var mouse = new THREE.Vector2(innerWidth / 2, innerHeight / 2);

document.body.style.perspective = `${perspective}px`;

init();

function init() {
  
  scene = new THREE.Scene();
  
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true, 
    canvas 
  });
  
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);  

  // console.log("RENDERER", renderer)

  camera = new THREE.PerspectiveCamera()
  camera.position.set(0, 0, perspective);
  camera.far = perspective + 1000;
  
  var geom = new THREE.BoxBufferGeometry(element.clientWidth, element.clientHeight, element.clientWidth);
  var mat = new THREE.MeshStandardMaterial({ color: 0x00897b });
  // var mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(0, 0, -element.clientWidth / 2);

  var light1 = new THREE.AmbientLight(0xffffff, 0.5);
  var light2 = new THREE.DirectionalLight(0xffffff, 1);
  light2.position.set(0, 200, 0);
  
  scene.add(light1, light2, mesh);
    
  resize();
  mapCoords();
  animate();
  
  gsap.ticker.add(render);
  // renderer.setAnimationLoop(render);

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    mouse.set(e.x, e.y);
    mapCoords();
  }); 
}

function animate() {
  
  const { position, scale, rotation } = mesh;
  
  gsap.to(rotation, {
    x: Math.PI * 2,
    y: -Math.PI * 2,
    z: -Math.PI * 2,
    repeat: -1,
    duration: 4,
    ease: "none"
  });
}

function render() {
  renderer.render(scene, camera);

  stats.update();
}

function resize() {
  var fov = (180 * (2 * Math.atan(innerHeight / 2 / perspective))) / Math.PI;
  renderer.setSize(innerWidth, innerHeight);
  camera.fov = fov;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  mapCoords();
}

function mapCoords() {
  
  gsap.to(mesh.position, {
    duration: 0.2,
    x: -(innerWidth / 2 - mouse.x),
    y: innerHeight / 2 - mouse.y
  });
  
  gsap.to(element, {
    duration: 0.2,
    xPercent: -50,
    yPercent: -50,
    x: mouse.x,
    y: mouse.y
  });
}
