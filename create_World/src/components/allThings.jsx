"use client"
import { motion } from "framer-motion"

import CrewQuarters from "./crewQuarters"
import AirLock from "./airLock"
import Laboratory from "./laboratory"
import EngineeringBay from "./engineeringBay"
import WasteManagement from "./wasteManagement"
import DockingArea from "./dockingArea"
import Navbar from "./navBar"

const SpaceStationLayout = () => {
  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  // Item animation
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    },
    hover: {
      scale: 1.05,
      y: -8,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
    },
    tap: {
      scale: 0.98,
      rotateX: "5deg",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
      },
    },
  }

  // Glow pulse animation
  const glowPulse = {
    initial: { opacity: 0.7 },
    animate: {
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  // Blueprint grid pattern
  const blueprintPattern = {
    backgroundImage: `
      linear-gradient(rgba(0, 149, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 149, 255, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: "20px 20px",
  }

  return (
    <div
      className="bg-[#050A14] min-h-screen p-6 md:p-10 flex items-center justify-center overflow-hidden relative min-w-screen"
      style={blueprintPattern}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute top-2/3 right-1/4 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
        </div>
      </div>

      {/* Navbar */}
        <div
          className="absolute top-0 left-0 w-full p-4 z-50 bg-#15112b bg-opacity-50 rounded-lg shadow-lg"
          style={{
            transform: "translateZ(100px)",
            perspective: "1000px",
          }}
        >
          <Navbar />
        </div>
        {/* Animated glow effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl"
        variants={glowPulse}
        initial="initial"
        animate="animate"
        style={{
          transform: "translate(-50%, -50%)",
        }}
      ></motion.div>

      {/* Main container */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 w-full max-w-7xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Crew Quarters */}
        <motion.div className="relative group" variants={itemVariants} whileHover="hover" whileTap="tap">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          <div className="relative bg-[#0A1525] border border-cyan-500/30 rounded-lg overflow-hidden transform preserve-3d shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            {/* Header */}
            <div className="bg-[#081020] border-b border-cyan-500/30 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-cyan-400 font-bold tracking-wider text-lg uppercase font-['Orbitron',sans-serif] flex items-center">
                  <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                  CREW QUARTERS
                </h2>
                <p className="text-cyan-300/60 text-xs mt-0.5 font-mono">ALPHA-1 • STATUS: OPERATIONAL</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-cyan-400/30 border border-cyan-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-blue-400/30 border border-blue-400/50"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 h-[300px] relative">
              {/* Isometric effect wrapper */}
              <div className="w-full h-full transform-style-preserve-3d perspective-800 relative">
                <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-cyan-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-cyan-400/50 rounded-full"></div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-cyan-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-400/50 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 z-10">
                  <div className="text-xs text-cyan-400/70 font-mono">X: 145 Y: 278</div>
                </div>
                <div className="flux justify-center items-center">
                  <CrewQuarters />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#081020] border-t border-cyan-500/30 px-4 py-2 flex justify-between items-center">
              <div className="text-xs text-cyan-300/60 font-mono">ID: CQ-2187</div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs text-cyan-400 font-mono">ONLINE</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Air Lock */}
        <motion.div className="relative group" variants={itemVariants} whileHover="hover" whileTap="tap">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          <div className="relative bg-[#0A1525] border border-blue-500/30 rounded-lg overflow-hidden transform preserve-3d shadow-[0_0_15px_rgba(37,99,235,0.15)]">
            {/* Header */}
            <div className="bg-[#081020] border-b border-blue-500/30 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-blue-400 font-bold tracking-wider text-lg uppercase font-['Orbitron',sans-serif] flex items-center">
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                  AIR LOCK
                </h2>
                <p className="text-blue-300/60 text-xs mt-0.5 font-mono">BETA-2 • STATUS: SEALED</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-blue-400/30 border border-blue-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-indigo-400/30 border border-indigo-400/50"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 h-[300px] relative">
              {/* Isometric effect wrapper */}
              <div className="w-full h-full transform-style-preserve-3d perspective-800 relative">
                <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-blue-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-400/50 rounded-full"></div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-blue-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-indigo-400/50 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 z-10">
                  <div className="text-xs text-blue-400/70 font-mono">X: 089 Y: 342</div>
                </div>

                <AirLock />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#081020] border-t border-blue-500/30 px-4 py-2 flex justify-between items-center">
              <div className="text-xs text-blue-300/60 font-mono">ID: AL-0517</div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs text-blue-400 font-mono">SECURE</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Laboratory */}
        <motion.div className="relative group" variants={itemVariants} whileHover="hover" whileTap="tap">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          <div className="relative bg-[#0A1525] border border-purple-500/30 rounded-lg overflow-hidden transform preserve-3d shadow-[0_0_15px_rgba(147,51,234,0.15)]">
            {/* Header */}
            <div className="bg-[#081020] border-b border-purple-500/30 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-purple-400 font-bold tracking-wider text-lg uppercase font-['Orbitron',sans-serif] flex items-center">
                  <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                  LABORATORY
                </h2>
                <p className="text-purple-300/60 text-xs mt-0.5 font-mono">GAMMA-3 • STATUS: ACTIVE</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-purple-400/30 border border-purple-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-fuchsia-400/30 border border-fuchsia-400/50"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 h-[300px] relative">
              {/* Isometric effect wrapper */}
              <div className="w-full h-full transform-style-preserve-3d perspective-800 relative">
                <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-purple-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-400/50 rounded-full"></div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-purple-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-fuchsia-400/50 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 z-10">
                  <div className="text-xs text-purple-400/70 font-mono">X: 221 Y: 156</div>
                </div>

                <Laboratory />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#081020] border-t border-purple-500/30 px-4 py-2 flex justify-between items-center">
              <div className="text-xs text-purple-300/60 font-mono">ID: LB-4291</div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs text-purple-400 font-mono">RESEARCH</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Engineering Bay */}
        <motion.div className="relative group" variants={itemVariants} whileHover="hover" whileTap="tap">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          <div className="relative bg-[#0A1525] border border-orange-500/30 rounded-lg overflow-hidden transform preserve-3d shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            {/* Header */}
            <div className="bg-[#081020] border-b border-orange-500/30 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-orange-400 font-bold tracking-wider text-lg uppercase font-['Orbitron',sans-serif] flex items-center">
                  <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                  ENGINEERING BAY
                </h2>
                <p className="text-orange-300/60 text-xs mt-0.5 font-mono">DELTA-4 • STATUS: MAINTENANCE</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-orange-400/30 border border-orange-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-red-400/30 border border-red-400/50"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 h-[300px] relative">
              {/* Isometric effect wrapper */}
              <div className="w-full h-full transform-style-preserve-3d perspective-800 relative">
                <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-orange-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-orange-400/50 rounded-full"></div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-orange-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-400/50 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 z-10">
                  <div className="text-xs text-orange-400/70 font-mono">X: 312 Y: 094</div>
                </div>

                <EngineeringBay />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#081020] border-t border-orange-500/30 px-4 py-2 flex justify-between items-center">
              <div className="text-xs text-orange-300/60 font-mono">ID: EB-7734</div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs text-orange-400 font-mono">SYSTEMS</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Waste Management */}
        <motion.div className="relative group" variants={itemVariants} whileHover="hover" whileTap="tap">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          <div className="relative bg-[#0A1525] border border-green-500/30 rounded-lg overflow-hidden transform preserve-3d shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            {/* Header */}
            <div className="bg-[#081020] border-b border-green-500/30 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-green-400 font-bold tracking-wider text-lg uppercase font-['Orbitron',sans-serif] flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  WASTE MANAGEMENT
                </h2>
                <p className="text-green-300/60 text-xs mt-0.5 font-mono">EPSILON-5 • STATUS: RECYCLING</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-400/30 border border-green-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400/30 border border-emerald-400/50"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 h-[300px] relative">
              {/* Isometric effect wrapper */}
              <div className="w-full h-full transform-style-preserve-3d perspective-800 relative">
                <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-green-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-400/50 rounded-full"></div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-green-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-emerald-400/50 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 z-10">
                  <div className="text-xs text-green-400/70 font-mono">X: 178 Y: 263</div>
                </div>

                <WasteManagement />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#081020] border-t border-green-500/30 px-4 py-2 flex justify-between items-center">
              <div className="text-xs text-green-300/60 font-mono">ID: WM-9102</div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs text-green-400 font-mono">EFFICIENT</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Docking Area */}
        <motion.div className="relative group" variants={itemVariants} whileHover="hover" whileTap="tap">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
          <div className="relative bg-[#0A1525] border border-amber-500/30 rounded-lg overflow-hidden transform preserve-3d shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            {/* Header */}
            <div className="bg-[#081020] border-b border-amber-500/30 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-amber-400 font-bold tracking-wider text-lg uppercase font-['Orbitron',sans-serif] flex items-center">
                  <span className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
                  DOCKING AREA
                </h2>
                <p className="text-amber-300/60 text-xs mt-0.5 font-mono">ZETA-6 • STATUS: STANDBY</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-amber-400/30 border border-amber-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/30 border border-yellow-400/50"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 h-[300px] relative">
              {/* Isometric effect wrapper */}
              <div className="w-full h-full transform-style-preserve-3d perspective-800 relative">
                <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-amber-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-amber-400/50 rounded-full"></div>
                  </div>
                  <div className="w-6 h-6 rounded-md bg-[#081020] border border-amber-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-yellow-400/50 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 z-10">
                  <div className="text-xs text-amber-400/70 font-mono">X: 067 Y: 189</div>
                </div>

                <DockingArea />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#081020] border-t border-amber-500/30 px-4 py-2 flex justify-between items-center">
              <div className="text-xs text-amber-300/60 font-mono">ID: DA-3365</div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs text-amber-400 font-mono">READY</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SpaceStationLayout

