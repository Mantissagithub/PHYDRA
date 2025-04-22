import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Rocket } from "lucide-react";
import ItemDashboard from "./itemThing";

const ContainerDashboard = ({ zoneName, zoneImgUrl }) => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null); // State for selected container

  const formattedZoneName = zoneName.replace(" ", "_");
  console.log("zoneName", formattedZoneName);

  const fetchContainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "https://phydra.onrender.com/api/get-containers",
        {
          params: {
            zoneName: formattedZoneName,
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (response.data.Response === "Success") {
        console.log(response.data.Containers);
        setContainers(response.data.Containers);
      } else {
        setError("Failed to fetch containers");
      }
    } catch (error) {
      setError("Failed to fetch containers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [zoneName]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  const zoneImageRef = useRef(null);

  useEffect(() => {
    if (zoneImageRef.current) {
      gsap.fromTo(
        zoneImageRef.current,
        {
          scale: 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        }
      );
    }
  }, [zoneName]);

  const closeModal = () => {
    setSelectedContainer(null);
  };

  return (
    <div className="bg-[#15112b] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center mb-4">
            <Rocket className="w-8 h-8 mr-3 text-[#f48599]" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-[#f05672] to-[#f8b4c0] text-transparent bg-clip-text">
                Container Dashboard
              </span>
            </h1>
          </div>
          <div className="text-[#e6e6e6] text-center max-w-2xl">
            <p className="text-sm md:text-base">
              Real-time monitoring system for International Space Station
              containers.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Zone Info */}
          <motion.div
            className="w-full lg:w-1/3 bg-[#1e1a3c] rounded-2xl p-6 shadow-xl border border-[#f48599]/20"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold text-[#f8b4c0] mb-4">
              Zone: {zoneName}
            </h2>
            <img
              ref={zoneImageRef}
              src={zoneImgUrl}
              alt={zoneName}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
          </motion.div>

          {/* Container List */}
          <motion.div
            className="w-full lg:w-2/3 bg-[#1e1a3c] rounded-2xl p-6 shadow-xl border border-[#f48599]/20"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold text-[#f8b4c0] mb-4">
              Containers
            </h2>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-[#f48599]/20 border-t-[#f48599] animate-spin"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {containers.map((container) => (
                    <motion.div
                      key={container}
                      className="bg-[#15112b] rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <h3 className="text-lg font-medium text-[#f8b4c0] mb-2">
                        {container}
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "#f05672" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#f48599] text-white font-bold py-2 px-4 rounded-xl self-start"
                        onClick={() => setSelectedContainer(container)} // Open modal with container ID
                      >
                        View Items
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal for ItemDashboard */}
      <AnimatePresence>
        {selectedContainer && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-[#1e1a3c] rounded-lg shadow-2xl w-[400px] overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  className="absolute top-2 right-2 text-white/60 hover:text-white text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
                  onClick={closeModal}
                >
                  ×
                </button>
                <ItemDashboard containerIdx={selectedContainer} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContainerDashboard;
