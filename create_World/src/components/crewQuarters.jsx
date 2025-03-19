import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const CrewQuarters = () => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      currentMount.clientWidth / currentMount.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(2, 2, 2); // Adjusted position
    camera.lookAt(0, 1, 0); // Adjusted lookAt to focus on the center
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    
    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffa500, 3, 10);
    pointLight.position.set(2, 3, 2);
    scene.add(pointLight);
    
    // Model loading
    const loader = new GLTFLoader();
    let model;
    let rotationDirection = 1;
    
    loader.load(
      '/models/room_with_container1.glb',
      function (gltf) {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        
        // Define materials
        const roomMaterial = new THREE.MeshStandardMaterial({
          color: 0x8B4513,
          roughness: 0.3,
          metalness: 0.9,
        });
        
        const containerMaterial = new THREE.MeshStandardMaterial({
          color: 0xc0c0c0,
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
        animate();
      },
      function (xhr) {
        console.log(`Model Loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      function (error) {
        console.error('An error happened while loading the model:', error);
      }
    );
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (model) {
        model.rotation.y += 0.01 * rotationDirection;
        if (model.rotation.y >= 0.8 || model.rotation.y <= -0.8) {
          rotationDirection *= -1; // Reverse the rotation direction
        }
      }
      
      renderer.render(scene, camera);
    };
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      renderer.dispose();
      if (model) {
        model.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        scene.remove(model);
      }
    };
  }, []);
  
  return <div ref={mountRef} className="w-full h-full min-h-[300px]"></div>;
};

export default CrewQuarters;
