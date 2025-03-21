import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const DockingArea = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    
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
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true 
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
      '/models/docking_area.glb',
      function (gltf) {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        // model.geometry.center();
        
        // Define enhanced materials
        const roomMaterial = new THREE.MeshStandardMaterial({
          color: 0x8B4513,
          roughness: 0.3,
          metalness: 0.9,
          emissive: 0x331a00,
          emissiveIntensity: 0.2
        });
        
        const containerMaterial = new THREE.MeshStandardMaterial({
          color: 0xc0c0c0,
          roughness: 0.1,
          metalness: 1,
          emissive: 0x555555,
          emissiveIntensity: 0.1
        });
        
        // Apply materials
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
        
        // Initial animation with GSAP
        gsap.from(model.position, {
          y: -2,
          duration: 1.5,
          ease: "elastic.out(1, 0.5)",
          onComplete: () => setIsLoaded(true)
        });
        
        // Start animation loop
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
  
  return (
    <div className="relative w-full h-[265px] bg-gradient-to-b from-gray-900 to-black overflow-hidden rounded-lg shadow-lg">
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
              className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-orange-500/30 text-orange-400 p-2 flex justify-between items-center"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span className="text-xs font-mono">DOCKING AREA ACTIVE</span>
              </div>
              <span className="text-xs font-mono">ROTATION STABILIZERS ENGAGED</span>
            </motion.div>
            
            {/* Bottom info panel */}
            {/* <motion.div
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm p-2 rounded-lg border border-orange-500/30 text-orange-400 text-xs font-mono"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              DOCKING AREA ROTATION: AUTOMATIC
            </motion.div> */}
            
            {/* Decorative corner elements
            <div className="absolute top-2 left-2 w-16 h-16 border-t border-l border-orange-500/30 rounded-tl-lg"></div>
            <div className="absolute bottom-2 right-2 w-16 h-16 border-b border-r border-orange-500/30 rounded-br-lg"></div> */}
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
            {/* Holographic portal loader */}
            <div className="relative w-40 h-40">
              {/* Outer rotating ring */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-orange-500/30"
                animate={{ 
                  rotate: 360,
                  boxShadow: ['0 0 10px rgba(255,140,0,0.3)', '0 0 20px rgba(255,140,0,0.5)', '0 0 10px rgba(255,140,0,0.3)']
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle rotating ring with opposite direction */}
              <motion.div 
                className="absolute inset-4 rounded-full border-2 border-orange-400/50"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner hexagon */}
              <motion.div 
                className="absolute inset-8 flex items-center justify-center"
                animate={{ rotate: 120 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <motion.polygon 
                      points="50,10 90,30 90,70 50,90 10,70 10,30" 
                      fill="none" 
                      stroke="#ff8c00" 
                      strokeWidth="2"
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        strokeDasharray: ["0, 300", "300, 0", "0, 300"]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </svg>
                </div>
              </motion.div>
              
              {/* Center pulsing core */}
              <motion.div 
                className="absolute inset-12 bg-orange-500 rounded-full flex items-center justify-center"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-black font-bold text-xl">
                  {Math.round(loadingProgress)}%
                </span>
              </motion.div>
              
              {/* Scanning lines */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    className="absolute w-full h-1 bg-orange-400/30"
                    initial={{ y: -100 }}
                    animate={{ y: 150 }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.5,
                      ease: "linear" 
                    }}
                  />
                ))}
              </div>
            </div>
            
            <motion.div 
              className="text-orange-400 text-xs font-mono mt-6 tracking-widest"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              INITIALIZING DOCKING PROTOCOLS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DockingArea;
