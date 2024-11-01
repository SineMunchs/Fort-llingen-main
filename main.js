import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GSAP from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


import SceneManager from './src/managers/SceneManager'
//import Petals from './src/objects/Petals.js'
import Grass from './src/objects/Grass.js'



let scene, camera, renderer, controls;
let sceneManager, /*petals*/ grass, floorMesh;

function init() {
    // Setup renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x222230);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Create scene
    scene = new THREE.Scene();

    // Setup camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.2, 1000);
    camera.position.set(-5, 3, 12);
    camera.layers.enable(1);

    // Setup controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(-1, 2, 3);
    controls.update();

    // Setup lighting
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(2, 5, 10);
    light.castShadow = true;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    
    //createSkybox();
    createFloor();
    createObjects();

    // Create petals and grass
    //petals = new Petals(scene);
    grass = new Grass(scene);

    createButtons();
    setupEventListeners();

    // Create and mount SceneManager
    sceneManager = new SceneManager(scene);
    sceneManager.mountScene(0);
}

function dtr(d){
    return d * (Math.PI/180);
}

/*function createSkybox() {
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('public/texture/clouds4.png');
    const backgroundGeometry = new THREE.SphereGeometry(100, 60, 40);
    backgroundGeometry.scale(-1, 1, 1);
    const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture });
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(backgroundMesh);
}*/

function createFloor() {
    const floorGeometry = new THREE.SphereGeometry(15, 32, 32);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xF0E68C, side: THREE.DoubleSide });
    floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.y = -15;
    floorMesh.name = 'Floor';
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
}


function createObjects() {
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2);
    const material = new THREE.MeshLambertMaterial();

    /*const cylinders = new THREE.Group();
    cylinders.add(createMesh(cylinderGeometry, material, 3, 1, 0, 'Cylinder A', 0));
    cylinders.add(createMesh(cylinderGeometry, material, 4.2, 1, 0, 'Cylinder B', 0));
    cylinders.add(createMesh(cylinderGeometry, material, 3.6, 3, 0, 'Cylinder C', 0));
    scene.add(cylinders);

    const boxes = new THREE.Group();
    boxes.add(createMesh(boxGeometry, material, -1, 1, 0, 'Box A', 0));
    boxes.add(createMesh(boxGeometry, material, -4, 1, 0, 'Box B', 0));
    boxes.add(createMesh(boxGeometry, material, -2.5, 3, 0, 'Box C', 0));
    scene.add(boxes);*/
}

function createMesh(geometry, material, x, y, z, name, layer) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(x, y, z);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.set(layer);
    return mesh;
}
function createButtons() {
  const previousButton = createButton('public/texture/Left .png', 'Previous Scene', '10px', '10px');
  const nextButton = createButton('public/texture/Right.png', 'Next Scene', 'auto', '10px');
  nextButton.style.right = '10px';

  previousButton.addEventListener('click', () => sceneManager.previousScene());
  nextButton.addEventListener('click', () => sceneManager.nextScene());
}

function createButton(imageSrc, altText, left, top) {
  const button = document.createElement('img');
  button.src = imageSrc;
  button.alt = altText;
  button.style.position = 'absolute';
  button.style.transform = 'translateY(500%)'; // Adjust to the center
  button.style.left = left;
  button.style.top = top;
  
  button.style.cursor = 'pointer';
  button.style.width = '90px'; // Adjust size as needed
  button.style.height = 'auto';
  document.body.appendChild(button);
  return button;
}

function setupEventListeners() {
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
          sceneManager.previousScene();
      } else if (event.key === 'ArrowRight') {
          sceneManager.nextScene();
      }
  });
}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseDown(event) {
    const coords = new THREE.Vector2(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(coords, camera);

    const intersections = raycaster.intersectObjects(scene.children, true);
    if (intersections.length > 0) {
        const selectedObject = intersections[0].object;
        console.log(`${selectedObject.name} was clicked!`);
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    sceneManager.updateScene();
   // petals.updatePetals();

    // Update grass
    if (grass.grassMesh) {
        grass.updateGrass(performance.now() * 0.001);
        grass.grassMesh.position.copy(floorMesh.position);
        grass.grassMesh.rotation.copy(floorMesh.rotation);
    }

    renderer.render(scene, camera);
}

// Initialize and start the animation
init();
animate();