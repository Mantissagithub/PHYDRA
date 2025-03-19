import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 2); // Adjusted position
camera.lookAt(0, 1, 0); // Adjusted lookAt to focus on the center of the scene

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Brighter global lighting
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffa500, 3, 10); // Warm orange light for room reflections
pointLight.position.set(2, 3, 2);
scene.add(pointLight);

const loader = new GLTFLoader();
let model;
let rotationDirection = 1; // 1 for clockwise, -1 for counterclockwise

loader.load(
  '/models/room_with_container1.glb', 
  function (gltf) {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);

    // Define materials
    const roomMaterial = new THREE.MeshStandardMaterial({
      color: 0xB22222, 
      roughness: 0.3,  
      metalness: 0.9,  
    });

    const containerMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0, 
      roughness: 0.1,  
      metalness: 1,    
    });

    // Apply materials based on object name
    model.traverse((child) => {
      if (child.isMesh) {
        if (child.name.includes("Room")) {
          child.material = roomMaterial;
        } else if (child.name.includes("Container")) {
          child.material = containerMaterial;
        }
      }
    });

    scene.add(model);
    renderer.setAnimationLoop(engineeringBay);
  },
  function (xhr) {
    console.log(`Model Loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  function (error) {
    console.error('An error happened while loading the model:', error);
  }
);

export default function engineeringBay() {
  if (model) {
    model.rotation.y += 0.01 * rotationDirection;
    if (model.rotation.y >= 0.8 || model.rotation.y <= -0.8) {
      rotationDirection *= -1; // Reverse the rotation direction
    }
  }
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});