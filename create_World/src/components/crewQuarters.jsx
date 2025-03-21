import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const CrewQuarters = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const timelineRef = useRef(null);
  
  // Initialize the 3D scene
  useEffect(() => {
    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Add stars to the background
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
    });
    
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
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
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls for zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 4;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;
    
    // Lighting Setup with space-themed colors
    const ambientLight = new THREE.AmbientLight(0x2c3e50, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x7f8c8d, 2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const bluePointLight = new THREE.PointLight(0x3498db, 2, 10);
    bluePointLight.position.set(-2, 3, 2);
    scene.add(bluePointLight);
    
    const purplePointLight = new THREE.PointLight(0x9b59b6, 2, 10);
    purplePointLight.position.set(2, 3, -2);
    scene.add(purplePointLight);
    
    // Model loading
    const loader = new GLTFLoader();
    
    loader.load(
      '/models/room_with_container3.glb',
      function (gltf) {
        const model = gltf.scene;
        modelRef.current = model;
        
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        
        // Define futuristic space materials
        const roomMaterial = new THREE.MeshStandardMaterial({
          color: 0x34495e,
          roughness: 0.2,
          metalness: 0.8,
          emissive: 0x2c3e50,
          emissiveIntensity: 0.2
        });
        
        const containerMaterial = new THREE.MeshStandardMaterial({
          color: 0x95a5a6,
          roughness: 0.1,
          metalness: 1,
          emissive: 0x3498db,
          emissiveIntensity: 0.1
        });
        
        // Apply materials based on object name
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
        timelineRef.current = gsap.timeline();
        timelineRef.current
          .from(model.position, { 
            y: -2, 
            duration: 1.5, 
            ease: "elastic.out(1, 0.5)" 
          })
          .from(model.scale, { 
            x: 0.5, 
            y: 0.5, 
            z: 0.5, 
            duration: 1, 
            ease: "back.out(1.7)" 
          }, "-=1")
          .to(model.rotation, {
            y: Math.PI * 2,
            duration: 2,
            ease: "power1.inOut"
          }, "-=0.5")
          .to(model.position, {
            y: 0.1,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        
        setIsLoaded(true);
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
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (stars) {
        stars.rotation.y += 0.0005;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
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
  
  // Handle hover interactions
  const handleMouseMove = (e) => {
    if (!isLoaded || !modelRef.current) return;
    
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    setHoverPosition({ x, y });
    
    // Rotate the model based on mouse position
    gsap.to(modelRef.current.rotation, {
      x: y * 0.1,
      y: x * 0.2,
      duration: 0.5,
      ease: "power2.out"
    });
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
    
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
    
    // Zoom in slightly
    gsap.to(cameraRef.current.position, {
      x: 1.8,
      y: 1.8,
      z: 1.8,
      duration: 0.8,
      ease: "power2.out"
    });
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    
    if (modelRef.current) {
      // Reset rotation
      gsap.to(modelRef.current.rotation, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }
    
    // Reset camera position
    gsap.to(cameraRef.current.position, {
      x: 2,
      y: 2,
      z: 2,
      duration: 0.8,
      ease: "power2.out"
    });
  };
  
  return (
    <div className="relative w-full h-full">
      {/* Space-themed card container */}
      <motion.div 
        className="relative w-full h-full min-h-[265px] rounded-xl overflow-hidden bg-gradient-to-b from-gray-900 to-blue-900 shadow-lg border border-blue-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 3D scene container */}
        <div 
          ref={mountRef} 
          className="w-full h-full min-h-[265px] flex justify-center items-center"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
                <div className="absolute inset-1 rounded-full border-2 border-transparent border-l-purple-500 animate-spin-slow"></div>
              </div>
              <div className="mt-4 text-blue-400 font-medium tracking-wider animate-pulse">
                LOADING QUARTERS
              </div>
            </div>
          </div>
        )}
        
        {/* Space-themed UI elements */}
        {isLoaded && (
          <>
            {/* Top info panel */}
            <motion.div 
              className="absolute top-3 left-3 right-3 flex justify-between items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="bg-gray-900/50 backdrop-blur-sm px-3 py-1 rounded-md border border-blue-500/30">
                <span className="text-xs text-blue-400 font-mono">CREW QUARTERS • DECK 3</span>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm px-3 py-1 rounded-md border border-blue-500/30">
                <span className="text-xs text-green-400 font-mono">STATUS: OPERATIONAL</span>
              </div>
            </motion.div>
            
            {/* Bottom control panel */}
            <motion.div 
              className="absolute bottom-3 left-3 right-3 flex justify-between items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className="bg-gray-900/50 backdrop-blur-sm px-3 py-1 rounded-md border border-blue-500/30">
                <span className="text-xs text-blue-400 font-mono">CAPACITY: 4 CREW</span>
              </div>
              
              <div className="flex space-x-2">
                <motion.button 
                  className="bg-blue-600/80 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-md backdrop-blur-sm border border-blue-400/30 font-mono"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  VIEW DETAILS
                </motion.button>
                <motion.button 
                  className="bg-gray-800/80 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded-md backdrop-blur-sm border border-gray-600/30 font-mono"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  RESET VIEW
                </motion.button>
              </div>
            </motion.div>
            
            {/* Hover indicator */}
            {isHovering && (
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-xl"></div>
                <div 
                  className="absolute w-20 h-20 rounded-full border border-blue-500/20 backdrop-blur-sm pointer-events-none"
                  style={{ 
                    left: `calc(${(hoverPosition.x + 1) / 2 * 100}% - 10px)`, 
                    top: `calc(${(hoverPosition.y + 1) / 2 * 100}% - 10px)`,
                    opacity: 0.1
                  }}
                ></div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
      
      {/* Add custom Tailwind styles for animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CrewQuarters;
