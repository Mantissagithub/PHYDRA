import React from 'react';
import { motion } from 'framer-motion';

// Import components
import CrewQuarters from './crewQuarters';
// import CrewQuarters from './crewQuarters';
import airLock from './airLock';
// import AirLock from './airLock';
import laboratory from './laboratory';
// import Laboratory from './laboratory';
import engineeringBay from './engineeringBay';
// import EngineeringBay from './engineeringBay';
import wasteManagement from './wasteManagement';
// import WasteManagement from './wasteManagement';
import dockingArea from './dockingArea';
// import DockingArea from './dockingArea';

const SpaceStationLayout = () => {
  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  // Item animation
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-8 flex items-center justify-center">
      <motion.div
        className="grid grid-cols-2 gap-6 w-full max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Row 1 */}
        <motion.div 
          className="bg-indigo-900/40 backdrop-blur-md rounded-2xl p-6 border border-indigo-500/30 shadow-xl shadow-indigo-500/20"
          variants={itemVariants}
          whileHover="hover"
        >
          <h2 className="text-2xl font-bold text-indigo-300 mb-4 tracking-tight">Crew Quarters</h2>
          <div className="h-full">
            <CrewQuarters />
          </div>
        </motion.div>

        <motion.div 
          className="bg-blue-900/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30 shadow-xl shadow-blue-500/20"
          variants={itemVariants}
          whileHover="hover"
        >
          <h2 className="text-2xl font-bold text-blue-300 mb-4 tracking-tight">Air Lock</h2>
          <div className="h-full">
            <airLock />
          </div>
        </motion.div>

        {/* Row 2 */}
        <motion.div 
          className="bg-purple-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-xl shadow-purple-500/20"
          variants={itemVariants}
          whileHover="hover"
        >
          <h2 className="text-2xl font-bold text-purple-300 mb-4 tracking-tight">Laboratory</h2>
          <div className="h-full">
            <laboratory />
          </div>
        </motion.div>

        <motion.div 
          className="bg-red-900/40 backdrop-blur-md rounded-2xl p-6 border border-red-500/30 shadow-xl shadow-red-500/20"
          variants={itemVariants}
          whileHover="hover"
        >
          <h2 className="text-2xl font-bold text-red-300 mb-4 tracking-tight">Engineering Bay</h2>
          <div className="h-full">
            <engineeringBay />
          </div>
        </motion.div>

        {/* Row 3 */}
        <motion.div 
          className="bg-green-900/40 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 shadow-xl shadow-green-500/20"
          variants={itemVariants}
          whileHover="hover"
        >
          <h2 className="text-2xl font-bold text-green-300 mb-4 tracking-tight">Waste Management</h2>
          <div className="h-full">
            <wasteManagement />
          </div>
        </motion.div>

        <motion.div 
          className="bg-amber-900/40 backdrop-blur-md rounded-2xl p-6 border border-amber-500/30 shadow-xl shadow-amber-500/20"
          variants={itemVariants}
          whileHover="hover"
        >
          <h2 className="text-2xl font-bold text-amber-300 mb-4 tracking-tight">Docking Area</h2>
          <div className="h-full">
            <dockingArea />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SpaceStationLayout;
