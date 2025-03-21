import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const WasteManagement = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [recycleRate, setRecycleRate] = useState(68);
  const [wasteVolume, setWasteVolume] = useState(84);
  
  useEffect(() => {
    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2e1a); // Dark green background
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      currentMount.clientWidth / currentMount.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(3, 2, 3);
    
    // Renderer setup with improved settings
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
    
    // Enhanced lighting for waste management facility
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Secondary light from another angle
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 1.8);
    secondaryLight.position.set(-5, 8, -5);
    scene.add(secondaryLight);
    
    // Green facility lights
    const greenPointLight = new THREE.PointLight(0x4CAF50, 2, 10);
    greenPointLight.position.set(-2, 3, 2);
    scene.add(greenPointLight);
    
    // Model loading
    const loader = new GLTFLoader();
    let model;
    let rotationDirection = 1;
    
    loader.load(
      '/models/waste_mgmt.glb',
      function (gltf) {
        model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.set(-center.x, -center.y, -center.z);
        
        // Enhanced materials for waste management
        const roomMaterial = new THREE.MeshStandardMaterial({
          color: 0x556B2F, // Olive green
          roughness: 0.3,
          metalness: 0.9,
          emissive: 0x1a2e1a,
          emissiveIntensity: 0.2
        });
        
        const containerMaterial = new THREE.MeshStandardMaterial({
          color: 0xC0C0C0, // Silver
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
    <div className="relative w-full h-[265px] bg-gradient-to-b from-green-900 to-gray-900 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Waste Management UI Overlay */}
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
              <span className="text-xs font-mono">WASTE MANAGEMENT FACILITY: OPERATIONAL</span>
            </div>
          </motion.div>
          
          {/* Left side panel */}
          <motion.div 
            className="absolute top-16 left-4 w-48 bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-3"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="text-green-400 font-mono text-xs border-b border-green-500/30 pb-1 mb-2">FACILITY METRICS</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>RECYCLE RATE</span>
                  <span>{recycleRate}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <motion.div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    initial={{ width: `${recycleRate}%` }}
                    animate={{ width: [`${recycleRate-5}%`, `${recycleRate+5}%`, `${recycleRate}%`] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>WASTE VOLUME</span>
                  <span>{wasteVolume} TONS</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <motion.div 
                    className="bg-yellow-500 h-1.5 rounded-full" 
                    initial={{ width: `${wasteVolume}%` }}
                    animate={{ width: [`${wasteVolume-10}%`, `${wasteVolume}%`] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>ENERGY PRODUCTION</span>
                  <span>42 MW</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <motion.div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    initial={{ width: "42%" }}
                    animate={{ width: ["38%", "45%", "42%"] }}
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
      
      {/* Waste Management Loading Screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Recycling symbol background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg className="w-full h-full max-w-md" viewBox="0 0 100 100">
                {/* Recycling arrows */}
                <motion.path
                  d="M35,20 L65,20 L50,40 Z"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                />
                <motion.path
                  d="M65,60 L65,20 L85,40 Z"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 2, delay: 0.6, repeat: Infinity, repeatType: "loop" }}
                />
                <motion.path
                  d="M35,60 L15,40 L35,20 Z"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 2, delay: 1.2, repeat: Infinity, repeatType: "loop" }}
                />
              </svg>
            </div>
            
            {/* Trash can loader */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Trash can body */}
                <motion.rect
                  x="30" y="40" width="40" height="50"
                  rx="2" ry="2"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                />
                
                {/* Trash can lid */}
                <motion.path
                  d="M25,40 L75,40 L75,35 L25,35 Z"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatType: "loop" }}
                />
                
                {/* Trash can handle */}
                <motion.path
                  d="M45,35 L45,30 L55,30 L55,35"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatType: "loop" }}
                />
                
                {/* Falling trash */}
                {[...Array(3)].map((_, i) => (
                  <motion.circle
                    key={`trash-${i}`}
                    cx={40 + i * 10}
                    cy={30}
                    r={2}
                    fill="#4CAF50"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 60, opacity: [0, 1, 0] }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.5, 
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                ))}
              </svg>
              
              {/* Progress circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#1a2e1a" 
                    strokeWidth="6"
                  />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#4CAF50" 
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
            
            {/* Loading text with waste management terms */}
            <motion.div 
              className="mt-8 text-green-400 text-sm font-mono text-center max-w-md px-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="mb-2">INITIALIZING WASTE MANAGEMENT SYSTEMS</div>
              <motion.div 
                className="text-xs text-green-300/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
              >
                {loadingProgress < 30 && "CALIBRATING SORTING MECHANISMS..."}
                {loadingProgress >= 30 && loadingProgress < 60 && "OPTIMIZING RECYCLING PROTOCOLS..."}
                {loadingProgress >= 60 && loadingProgress < 90 && "INITIALIZING WASTE-TO-ENERGY CONVERTERS..."}
                {loadingProgress >= 90 && "ACTIVATING ENVIRONMENTAL MONITORING..."}
              </motion.div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      </div>
      );
  };

export default WasteManagement;
