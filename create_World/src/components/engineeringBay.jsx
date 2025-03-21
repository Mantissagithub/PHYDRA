import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const EngineeringBay = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [oxygenLevel, setOxygenLevel] = useState(87);
  const [powerLevel, setPowerLevel] = useState(92);
  
  useEffect(() => {
    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);
    
    // Orbit controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    
    // Enhanced lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Increased intensity
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5); // Increased intensity
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Add a second directional light from another angle
const secondaryLight = new THREE.DirectionalLight(0xffffff, 1.8);
secondaryLight.position.set(-5, 8, -5);
scene.add(secondaryLight);

// Brighter red engineering bay lights
const redPointLight = new THREE.PointLight(0xff3333, 3, 15); // Increased intensity and range
redPointLight.position.set(-2, 3, 2);
scene.add(redPointLight);

const bluePointLight = new THREE.PointLight(0x3333ff, 2.5, 12); // Increased intensity and range
bluePointLight.position.set(2, 2, -2);
scene.add(bluePointLight);

// Add a white spotlight to highlight the model
const spotlight = new THREE.SpotLight(0xffffff, 2);
spotlight.position.set(0, 8, 0);
spotlight.angle = Math.PI / 4;
spotlight.penumbra = 0.1;
spotlight.decay = 1;
spotlight.distance = 20;
spotlight.castShadow = true;
scene.add(spotlight);

// Brighter background color
scene.background = new THREE.Color(0x111122); // Slightly blue-tinted dark background instead of pure black

    
    // Model loading
    const loader = new GLTFLoader();
    let model;
    
    loader.load(
      '/models/room_with_container2.glb',
      function (gltf) {
        model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.set(-center.x, -center.y, -center.z);
        
        // Enhanced materials for engineering bay
        const roomMaterial = new THREE.MeshStandardMaterial({
          color: 0xB22222, 
          roughness: 0.3,
          metalness: 0.9,
          emissive: 0x330000,
          emissiveIntensity: 0.2
        });
        
        const containerMaterial = new THREE.MeshStandardMaterial({
          color: 0xC0C0C0,
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
        
        // Add periodic animation to model parts
        const tl = gsap.timeline({repeat: -1, yoyo: true});
        tl.to(redPointLight, {
          intensity: 3,
          duration: 1.5,
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
      
      {/* Engineering Bay UI Overlay */}
      {isLoaded && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top status bar */}
          <motion.div 
            className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-red-500/30 text-red-400 p-2 flex justify-between items-center"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-mono">ENGINEERING BAY STATUS: OPERATIONAL</span>
            </div>
          </motion.div>
          
          {/* Left side panel */}
          <motion.div 
            className="absolute top-16 left-4 w-48 bg-black/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-3"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="text-red-400 font-mono text-xs border-b border-red-500/30 pb-1 mb-2">SYSTEM DIAGNOSTICS</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>OXYGEN LEVEL</span>
                  <span>{oxygenLevel}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${oxygenLevel}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>POWER SYSTEMS</span>
                  <span>{powerLevel}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${powerLevel}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>MAINTENANCE</span>
                  <span>SCHEDULED</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <motion.div 
                    className="bg-yellow-500 h-1.5 rounded-full" 
                    initial={{ width: "30%" }}
                    animate={{ width: ["30%", "70%", "30%"] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Corner decorative elements
          <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-red-500/30 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-red-500/30 rounded-bl-lg"></div> */}
        </div>
      )}
      
      {/* Space-themed Loading Screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Engineering schematic background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 grid grid-cols-12 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div 
                    key={`grid-col-${i}`}
                    className="h-full border-r border-red-500/30"
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 grid grid-rows-12 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div 
                    key={`grid-row-${i}`}
                    className="w-full border-b border-red-500/30"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                  />
                ))}
              </div>
            </div>
            
            {/* Futuristic engineering loader */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Outer rotating ring */}
              <motion.div 
                className="absolute w-full h-full rounded-full border-2 border-red-500/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle rotating hexagon */}
              <motion.div 
                className="absolute w-40 h-40 flex items-center justify-center"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <motion.polygon 
                    points="50,10 90,30 90,70 50,90 10,70 10,30" 
                    fill="none" 
                    stroke="#ff3333" 
                    strokeWidth="1"
                    animate={{ 
                      opacity: [0.3, 0.7, 0.3],
                      strokeDasharray: ["0, 300", "300, 0", "0, 300"]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </svg>
              </motion.div>
              
              {/* Inner progress circle */}
              <div className="absolute w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#330000" 
                    strokeWidth="6"
                  />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#ff3333" 
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
              </div>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-red-400 text-3xl font-mono font-bold">
                  {Math.round(loadingProgress)}%
                </span>
                <span className="text-red-500 text-xs font-mono mt-1">LOADING</span>
              </div>
              
              {/* Scanning lines */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    className="absolute w-full h-0.5 bg-red-500/30"
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
            
            {/* Loading text with engineering terms */}
            <motion.div 
              className="mt-8 text-red-400 text-sm font-mono text-center max-w-md px-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="mb-2">INITIALIZING ENGINEERING BAY SYSTEMS</div>
              <motion.div 
                className="text-xs text-red-300/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
              >
                {loadingProgress < 30 && "CALIBRATING MAINTENANCE EQUIPMENT..."}
                {loadingProgress >= 30 && loadingProgress < 60 && "LOADING STRUCTURAL SCHEMATICS..."}
                {loadingProgress >= 60 && loadingProgress < 90 && "INITIALIZING DIAGNOSTIC PROTOCOLS..."}
                {loadingProgress >= 90 && "PREPARING INTERACTIVE CONTROLS..."}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EngineeringBay;
