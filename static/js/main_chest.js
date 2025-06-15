// main_chest.js
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 20);
camera.position.set(0, 1, 3);

let renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setClearColor(0x262524);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

// Свет
let light1 = new THREE.AmbientLight(0xffffff, 1.25);
scene.add(light1);
let light2 = new THREE.PointLight(0xffecd1, 1.0, 10);
light2.position.set(0,2,2);
scene.add(light2);

// Модель сундука
let chest, lid;
let gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('/static/models/chest.glb', (gltf) => {
  chest = gltf.scene;
  scene.add(chest);

  lid = chest.getObjectByName('Lid') || chest.getObjectByName('Top') || chest.children[0];
  lid.rotation.x = 0; // закрыто

  chest.position.set(-0.4, 1.5, -1);  // Центр сцены
  chest.scale.set(1.8,1.8,1.8);

  render();
});

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

let opened = false, opening = false;
document.getElementById('three-container').addEventListener('click', () => {
  if (opening || opened || !chest) return;
  opening = true;
  document.getElementById('three-hint').style.opacity = 0;

  // Анимация влета в сундук
  let t = 0, duration = 1.08;
  let startZ = camera.position.z, endZ = 0.22;
  let startY = camera.position.y, endY = 0.56;
  function animate() {
    t += 1/60;
    let k = Math.min(t/duration, 1);
    camera.position.z = startZ + (endZ - startZ) * k;
    camera.position.y = startY + (endY - startY) * k;
    if (k < 1) {
      requestAnimationFrame(animate);
    } else {
      showFlash();
    }
  }
  animate();
});

// Вспышка и переход к поздравлению
function showFlash() {
  let flash = document.getElementById('flash');
  flash.classList.add('active');
  setTimeout(() => {
    flash.classList.remove('active');
    setTimeout(showCongrats, 600);
  }, 200); // Держим ярко 200 мс
}

function showCongrats() {
  opened = true;
  document.getElementById('three-container').style.display = 'none';
  document.getElementById('three-hint').style.display = 'none';
  document.getElementById('video-congrats').classList.add('show');
  document.body.style.overflow = "auto";
  let vid = document.getElementById('congrats-video');
  vid.currentTime = 0;
  vid.muted = false;
  vid.play();
}

// Адаптивность
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
