import React, { useEffect, useState } from "react"; // Removed useRef as zoneImageRef will be removed
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
// import gsap from "gsap"; // GSAP will be removed
import { Rocket } from "lucide-react";
import ItemDashboard from "./itemThing";

const ContainerDashboard = ({ zoneName, zoneImgUrl }) => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);

  const formattedZoneName = zoneName.replace(" ", "_");
  // console.log("zoneName", formattedZoneName); // Keep console logs for debugging if necessary, but often removed for production

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
    hidden: { opacity: 0, y: 30, scale: 0.9 }, // Slightly adjusted for consistency
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120, // Adjusted for a slightly softer spring
        damping: 18,
      },
    },
    exit: {
      opacity: 0,
      y: -30, // Consistent exit direction
      scale: 0.9,
      transition: {
        duration: 0.25, // Slightly longer duration
      },
    },
  };

  // GSAP useEffect for zoneImageRef is removed.

  const closeModal = () => {
    setSelectedContainer(null);
  };

  return (
    <div className="bg-nav-bg-start text-text-main py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-screen"> {/* Themed background and text, min-h-screen */}
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center mb-12 text-center" // Added text-center
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center mb-4">
            <Rocket className="w-10 h-10 mr-3 text-accent-pink" /> {/* Increased icon size, themed color */}
            <h1 className="text-3xl md:text-4xl font-bold"> {/* Adjusted text size for balance */}
              <span className="bg-gradient-to-r from-accent-red to-accent-pink-light text-transparent bg-clip-text">
                Container Dashboard
              </span>
            </h1>
          </div>
          <div className="text-text-main max-w-2xl"> {/* Themed text */}
            <p className="text-sm md:text-base">
              Real-time monitoring system for International Space Station
              containers.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Zone Info */}
          <motion.div
            className="w-full lg:w-1/3 bg-nav-bg-alt rounded-2xl p-6 shadow-xl border border-accent-pink/20" // Themed bg and border
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold text-accent-pink-light mb-4"> {/* Themed text */}
              Zone: {zoneName}
            </h2>
            <motion.img // Converted to motion.img
              src={zoneImgUrl}
              alt={zoneName}
              className="w-full h-48 object-cover rounded-xl mb-4 shadow-md" // Added shadow
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }} // Mapped power3.out to easeOut
            />
            {/* Additional zone details can be added here if needed */}
          </motion.div>

          {/* Container List */}
          <motion.div
            className="w-full lg:w-2/3 bg-nav-bg-alt rounded-2xl p-6 shadow-xl border border-accent-pink/20" // Themed bg and border
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold text-accent-pink-light mb-4"> {/* Themed text */}
              Containers
            </h2>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-accent-pink/20 border-t-accent-pink animate-spin"></div> {/* Themed spinner */}
                </div>
              </div>
            ) : error ? (
              <div className="text-accent-red p-4 bg-accent-red/10 rounded-lg text-center">{error}</div> // Themed error message
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr"> {/* Adjusted gap and md columns */}
                <AnimatePresence>
                  {containers.map((container) => (
                    <motion.div
                      key={container} // Assuming container name/ID is unique
                      className="bg-nav-bg-start rounded-xl p-4 shadow-lg hover:shadow-primary-dark/30 transition-shadow duration-300 flex flex-col justify-between cursor-pointer" // Themed bg, adjusted padding, added cursor
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onClick={() => setSelectedContainer(container)} // Make the whole card clickable
                    >
                      <h3 className="text-lg font-semibold text-accent-pink-light mb-3 break-all"> {/* Changed text-md to text-lg for consistency */}
                        {container}
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "#f05672" /* accent-red */, boxShadow: "0px 5px 15px rgba(240, 86, 114, 0.4)" }} // Enhanced hover
                        whileTap={{ scale: 0.95, filter: "brightness(0.9)"}}
                        className="bg-accent-pink text-text-main font-medium py-2 px-3 text-xs rounded-lg self-start mt-auto" // Themed button, adjusted padding, text size, margin-top auto
                        // onClick is now on the parent div, but can be kept here if specific button action is needed independent of card click
                        // onClick={() => setSelectedContainer(container)} 
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
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" // Increased z-index, increased backdrop opacity
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal} // Close modal on backdrop click
          >
            <motion.div
              className="bg-nav-bg-alt rounded-lg shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl overflow-hidden border border-accent-pink/30" // Responsive width, themed bg, added border
              initial={{ scale: 0.9, opacity: 0, y: 20 }} // Slightly adjusted initial animation
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }} // Springy transition
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
            >
              <div className="relative p-5"> {/* Added padding to modal content area */}
                <motion.button
                  className="absolute top-3 right-3 text-text-main/70 hover:text-text-main text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-text-main/10 transition-colors" // Themed close button
                  onClick={closeModal}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  &times; {/* Standard HTML entity for '×' */}
                </motion.button>
                <ItemDashboard containerIdx={selectedContainer} zoneName={formattedZoneName} /> {/* Passed zoneName for context if ItemDashboard needs it */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContainerDashboard;
