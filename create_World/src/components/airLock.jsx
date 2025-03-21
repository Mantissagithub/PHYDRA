import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const AirLock = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  
  useEffect(() => {
    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Add space background
    const spaceTexture = new THREE.TextureLoader().load('/space_background.jpg');
    scene.background = spaceTexture;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      currentMount.clientWidth / currentMount.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true 
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls for interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 4;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;
    
    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const bluePointLight = new THREE.PointLight(0x0077be, 2, 10);
    bluePointLight.position.set(-2, 3, 2);
    scene.add(bluePointLight);
    
    // Model loading
    const loader = new GLTFLoader();
    
    loader.load(
      '/models/room_with_container2.glb',
      function (gltf) {
        const model = gltf.scene;
        modelRef.current = model;
        
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        
        // Define futuristic materials
        const roomMaterial = new THREE.MeshStandardMaterial({
          color: 0x0077be,
          roughness: 0.2,
          metalness: 0.8,
          emissive: 0x00264d,
          emissiveIntensity: 0.2
        });
        
        const containerMaterial = new THREE.MeshStandardMaterial({
          color: 0xc0c0c0,
          roughness: 0.1,
          metalness: 1,
          emissive: 0x0077be,
          emissiveIntensity: 0.1
        });
        
        // Apply materials and enable shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.name.includes("Room")) {
              child.material = roomMaterial;
            } else if (child.name.includes("Container")) {
              child.material = containerMaterial;
            }
          }
        });
        
        scene.add(model);
        
        // Initial animation
        gsap.from(model.position, {
          y: -2,
          duration: 1.5,
          ease: "elastic.out(1, 0.5)",
          onComplete: () => setIsLoaded(true)
        });
        
        animate();
      },
      function (xhr) {
        const progress = (xhr.loaded / xhr.total) * 100;
        setLoadingProgress(progress);
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
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      renderer.render(scene, camera);
    };
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      if (modelRef.current) {
        modelRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        scene.remove(modelRef.current);
      }
    };
  }, []);
  
  const handleToggleAirlock = () => {
    setIsOpen(!isOpen);
    if (modelRef.current) {
      const targetRotation = isOpen ? 0 : Math.PI / 2;
      gsap.to(modelRef.current.rotation, {
        y: targetRotation,
        duration: 1.5,
        ease: "power2.inOut"
      });
    }
  };
  
  return (
    <div className="relative w-full h-[265px] bg-gradient-to-b from-gray-900 to-black overflow-hidden rounded-lg">
      {/* 3D Scene Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Stylish UI Overlay */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Top status bar */}
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-blue-500/30 text-blue-400 p-4 flex justify-between items-center"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center space-x-2">
                {/* <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div> */}
                <span className="text-sm font-mono">AIRLOCK STATUS: {isOpen ? 'OPEN' : 'CLOSED'}</span>
              </div>
              <span className="text-sm font-mono">PRESSURE: {isOpen ? 'EQUALIZING' : 'STABLE'}</span>
            </motion.div>
            
            {/* Control panel */}
            <motion.div
              className="absolute h-[25px] bottom-8 left-1/2 transform -translate-x-1/2 "
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.button
                className={`pointer-events-auto ${isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3 px-6 rounded-lg shadow-lg`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleAirlock}
              >
                {isOpen ? 'CLOSE AIRLOCK' : 'OPEN AIRLOCK'}
              </motion.button>
            </motion.div>
            
            {/* Decorative corner elements
            <div className="absolute top-4 left-4 w-24 h-24 border-t-2 border-l-2 border-blue-500/30 rounded-tl-lg"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 border-b-2 border-r-2 border-blue-500/30 rounded-br-lg"></div> */}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-48 h-48 relative flex items-center justify-center">
              {/* Circular loading indicator */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#0f172a" 
                  strokeWidth="8"
                />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * loadingProgress) / 100}
                  initial={{ rotate: -90 }}
                  animate={{ 
                    rotate: -90,
                    strokeDashoffset: 283 - (283 * loadingProgress) / 100
                  }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-blue-400 text-3xl font-mono font-bold">
                  {Math.round(loadingProgress)}%
                </span>
                <span className="text-blue-500 text-sm font-mono mt-2">LOADING</span>
              </div>
            </div>
            
            <motion.div 
              className="text-blue-400 text-sm font-mono mt-6"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              INITIALIZING AIRLOCK SYSTEMS...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AirLock;
