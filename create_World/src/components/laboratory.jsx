import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const Laboratory = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      currentMount.clientWidth / currentMount.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(3, 2, 3);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);
    
    // Orbit controls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minDistance = 2;
    controls.maxDistance = 8;
    
    // Enhanced lighting for laboratory
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Secondary light from another angle
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 1.8);
    secondaryLight.position.set(-5, 8, -5);
    scene.add(secondaryLight);
    
    // Green laboratory lights
    const greenPointLight = new THREE.PointLight(0x00ff88, 2, 10);
    greenPointLight.position.set(-2, 3, 2);
    scene.add(greenPointLight);
    
    const bluePointLight = new THREE.PointLight(0x0088ff, 1.5, 8);
    bluePointLight.position.set(2, 2, -2);
    scene.add(bluePointLight);
    
    // Model loading
    const loader = new GLTFLoader();
    let model;
    let rotationDirection = 1;
    
    loader.load(
      '/models/room_with_container3.glb',
      function (gltf) {
        model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.set(-center.x, -center.y, -center.z);
        
        // Enhanced materials for laboratory
        const roomMaterial = new THREE.MeshStandardMaterial({
          color: 0xADD8E6,
          roughness: 0.3,
          metalness: 0.9,
          emissive: 0x001a33,
          emissiveIntensity: 0.2
        });
        
        const containerMaterial = new THREE.MeshStandardMaterial({
          color: 0x696969,
          roughness: 0.1,
          metalness: 1,
          emissive: 0x222222,
          emissiveIntensity: 0.1
        });
        
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
        
        // Entrance animation
        gsap.from(model.position, {
          y: -3,
          duration: 2,
          ease: "elastic.out(1, 0.5)",
        });
        
        gsap.from(model.rotation, {
          y: Math.PI * 2,
          duration: 2.5,
          ease: "power2.out",
          onComplete: () => setIsLoaded(true)
        });
        
        // Pulse animation for lights
        gsap.to(greenPointLight, {
          intensity: 3,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        
        animate();
      },
      function (xhr) {
        setLoadingProgress((xhr.loaded / xhr.total) * 100);
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
      controls.update();
      renderer.render(scene, camera);
    };
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
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
    <div className="relative w-full h-[265px] bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Laboratory UI Overlay */}
      {isLoaded && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top status bar */}
          <motion.div 
            className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-green-500/30 text-green-400 p-2 flex justify-between items-center"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono">LABORATORY STATUS: ACTIVE</span>
            </div>
          </motion.div>
          
          {/* Left side panel */}
          <motion.div 
            className="absolute top-16 left-4 w-48 bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-3"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="text-green-400 font-mono text-xs border-b border-green-500/30 pb-1 mb-2">BIO METRICS</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>SPECIMEN VITALS</span>
                  <span>STABLE</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <motion.div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    initial={{ width: "70%" }}
                    animate={{ width: ["70%", "90%", "70%"] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>CELL DIVISION</span>
                  <span>ACTIVE</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <motion.div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    initial={{ width: "45%" }}
                    animate={{ width: ["45%", "65%", "45%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>MUTATION RATE</span>
                  <span>LOW</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <motion.div 
                    className="bg-yellow-500 h-1.5 rounded-full" 
                    initial={{ width: "20%" }}
                    animate={{ width: ["20%", "30%", "20%"] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Corner decorative elements
          <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-green-500/30 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-green-500/30 rounded-bl-lg"></div> */}
        </div>
      )}
      
      {/* Spider Web Loading Screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Spider web background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 800 800">
                {/* Concentric web circles */}
                {[...Array(8)].map((_, i) => (
                  <motion.circle
                    key={`web-circle-${i}`}
                    cx="400"
                    cy="400"
                    r={50 + i * 40}
                    fill="none"
                    stroke="#00ff88"
                    strokeWidth="1"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 0.3, pathLength: 1 }}
                    transition={{ duration: 2, delay: i * 0.2 }}
                  />
                ))}
                
                {/* Web spokes */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30) * Math.PI / 180;
                  const x2 = 400 + Math.cos(angle) * 350;
                  const y2 = 400 + Math.sin(angle) * 350;
                  
                  return (
                    <motion.line
                      key={`web-spoke-${i}`}
                      x1="400"
                      y1="400"
                      x2={x2}
                      y2={y2}
                      stroke="#00ff88"
                      strokeWidth="1"
                      initial={{ opacity: 0, pathLength: 0 }}
                      animate={{ opacity: 0.3, pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 1 + i * 0.1 }}
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* DNA Helix Loader */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* DNA strands */}
                <motion.path
                  d="M30,20 Q50,40 30,60 Q50,80 30,100"
                  fill="none"
                  stroke="#00ff88"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                />
                <motion.path
                  d="M70,20 Q50,40 70,60 Q50,80 70,100"
                  fill="none"
                  stroke="#0088ff"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "loop", delay: 0.5 }}
                />
                
                {/* DNA rungs */}
                {[...Array(5)].map((_, i) => (
                  <motion.line
                    key={`dna-rung-${i}`}
                    x1="30"
                    y1={30 + i * 15}
                    x2="70"
                    y2={30 + i * 15}
                    stroke="#ffffff"
                    strokeWidth="1"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.2, repeat: Infinity, repeatDelay: 2 }}
                  />
                ))}
              </svg>
              
              {/* Progress circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#001a0a" 
                    strokeWidth="6"
                  />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#00ff88" 
                    strokeWidth="6"
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
                  <span className="text-green-400 text-2xl font-mono font-bold">
                    {Math.round(loadingProgress)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Loading text with bio terms */}
            <motion.div 
              className="mt-8 text-green-400 text-sm font-mono text-center max-w-md px-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="mb-2">INITIALIZING LABORATORY SYSTEMS</div>
              <motion.div 
                className="text-xs text-green-300/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
              >
                {loadingProgress < 30 && "ANALYZING SPECIMEN DATA..."}
                {loadingProgress >= 30 && loadingProgress < 60 && "CALIBRATING MICROSCOPIC SENSORS..."}
                {loadingProgress >= 60 && loadingProgress < 90 && "PREPARING CULTURE MEDIUM..."}
                {loadingProgress >= 90 && "ACTIVATING BIOMETRIC INTERFACE..."}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Laboratory;
