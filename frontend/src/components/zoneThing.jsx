import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import gsap from "gsap"; // GSAP will be removed
import axios from "axios";
import {
  Rocket,
  Satellite,
  Radio,
  Orbit,
  Radar,
  AlertCircle,
  Wifi,
  X,
} from "lucide-react";
import ContainerDashboard from "./containerThing";

export default function SpaceZonesDashboard({ setZoneData }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // selectedZone and selectedZoneData are confirmed unused and will be removed by removing these lines.
  // const cardsRef = useRef(null); // Already removed as GSAP card animation is replaced
  // const starsRef = useRef(null); // Already removed as GSAP star animation is replaced

  // Static Zone Data with Image URLs
  const staticZones = [
    {
      name: "Life Support",
      imageUrl:
        "https://images.unsplash.com/photo-1702428903130-dda216ebd63f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      moduleId: "ISS-181",
      temperature: "21.6°C",
      pressure: "182.4 kPa",
      oxygenLevel: "21.8%",
      status: "Nominal",
    },
    {
      name: "Medical Bay",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1661855359165-99c68161d7dd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      moduleId: "ISS-182",
      temperature: "22.7°C",
      pressure: "181.7 kPa",
      oxygenLevel: "29.1%",
      status: "Nominal",
    },
    {
      name: "Engine Bay",
      imageUrl:
        "https://images.unsplash.com/photo-1546817312-6636ff08b06d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      moduleId: "ISS-183",
      temperature: "24.8°C",
      pressure: "181.5 kPa",
      oxygenLevel: "28.4%",
      status: "Nominal",
    },
    {
      name: "Command Center",
      imageUrl:
        "https://images.unsplash.com/photo-1737502483514-010a36cf6b9b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      moduleId: "ISS-184",
      temperature: "20.3°C",
      pressure: "182.8 kPa",
      oxygenLevel: "29.3%",
      status: "Nominal",
    },
    {
      name: "Crew Quarters",
      imageUrl:
        "https://images.unsplash.com/photo-1578852799294-cf61faaec83c?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      moduleId: "ISS-185",
      temperature: "23.7°C",
      pressure: "181.9 kPa",
      oxygenLevel: "29.4%",
      status: "Nominal",
    },
    {
      name: "Maintenance Bay",
      imageUrl:
        "https://media.istockphoto.com/id/1373098211/photo/nasa-spaceship-interior.webp?a=1&b=1&s=612x612&w=0&k=20&c=i9p7kw_zLFxCPiUdaCnxrvWuxnxrLj5JEtdR7KZeXKQ=",
      moduleId: "ISS-186",
      temperature: "21.7°C",
      pressure: "181.7 kPa",
      oxygenLevel: "28.8%",
      status: "Nominal",
    },
    {
      name: "Cockpit",
      imageUrl:
        "https://images.unsplash.com/photo-1704964969482-628c5e29d09a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      moduleId: "ISS-187",
      temperature: "22.1°C",
      pressure: "181.0 kPa",
      oxygenLevel: "28.8%",
      status: "Nominal",
    },
    {
      name: "Engineering Bay",
      imageUrl:
        "https://images.unsplash.com/photo-1607083984559-c4c42e3cb0b3?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      moduleId: "ISS-188",
      temperature: "23.4°C",
      pressure: "183.9 kPa",
      oxygenLevel: "29.8%",
      status: "Nominal",
    },
    {
      name: "External Storage",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1661386266452-54ebeaf7339d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      moduleId: "ISS-189",
      temperature: "22.3°C",
      pressure: "183.1 kPa",
      oxygenLevel: "29.4%",
      status: "Nominal",
    },
    {
      name: "Sanitation Bay",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1680391379670-5907f52bb0d9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGludGVybmF0aW9uYWwlMjBzcGFjZSUyMHN0YXRpb24lMjBzYW5pdGF0aW9uJTIwYmF5fGVufDB8fDB8fHww",
      moduleId: "ISS-110",
      temperature: "23.8°C",
      pressure: "182.1 kPa",
      oxygenLevel: "29.3%",
      status: "Nominal",
    },
    {
      name: "Airlock",
      imageUrl:
        "https://media.istockphoto.com/id/1057913042/photo/earth-in-spaceship-international-space-station-window-porthole-elements-of-this-image.webp?a=1&b=1&s=612x612&w=0&k=20&c=u6NzWDA7-qQxYZMqMBld2osniaa0cFDWMLFSsyzwo9A=",
      moduleId: "ISS-111",
      temperature: "24.3°C",
      pressure: "183.0 kPa",
      oxygenLevel: "29.0%",
      status: "Nominal",
    },
    {
      name: "Storage Bay",
      imageUrl:
        "https://media.istockphoto.com/id/1373098216/photo/nasa-international-space-station-iss-interior.webp?a=1&b=1&s=612x612&w=0&k=20&c=bV_sB3Y3nJl3MEBJiqGOk7ouatKlSJ4mSwiQ-77ofkU=",
      moduleId: "ISS-112",
      temperature: "20.2°C",
      pressure: "181.4 kPa",
      oxygenLevel: "29.4%",
      status: "Nominal",
    },
    {
      name: "Lab",
      imageUrl:
        "https://images.unsplash.com/photo-1658607204160-af3d7391fa5e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGludGVybmF0aW9uYWwlMjBzcGFjZSUyMHN0YXRpb24lMjBsYWJ8ZW58MHx8MHx8fDA%3D",
      moduleId: "ISS-113",
      temperature: "21.5°C",
      pressure: "182.2 kPa",
      oxygenLevel: "28.1%",
      status: "Nominal",
    },
    {
      name: "Greenhouse",
      imageUrl:
        "https://images.unsplash.com/photo-1740915143999-76b9d630bcf9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aW50ZXJuYXRpb25hbCUyMHNwYWNlJTIwc3RhdGlvbiUyMGdyZWVuaG91c2V8ZW58MHx8MHx8fDA%3D",
      moduleId: "ISS-114",
      temperature: "24.7°C",
      pressure: "182.3 kPa",
      oxygenLevel: "28.4%",
      status: "Nominal",
    },
    {
      name: "Power Bay",
      imageUrl:
        "https://media.istockphoto.com/id/658913150/photo/international-space-station-and-sun-above-the-earth.webp?a=1&b=1&s=612x612&w=0&k=20&c=Z4Ra2HbWojs7CmRDcTjVPnNsIVt_W20D1EJR9NhXy_0=",
      moduleId: "ISS-115",
      temperature: "21.1°C",
      pressure: "184.0 kPa",
      oxygenLevel: "28.1%",
      status: "Nominal",
    },
    {
      name: "otherZone",
      imageUrl:
        "https://images.unsplash.com/photo-1565501280525-2e9a49ad4463?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW50ZXJuYXRpb25hbCUyMHNwYWNlJTIwc3RhdGlvbiUyMHBvd2VyJTIwYmF5fGVufDB8fDB8fHww",
      moduleId: "ISS-115",
      temperature: "21.1°C",
      pressure: "184.0 kPa",
      oxygenLevel: "28.1%",
      status: "Nominal",
    },
  ];

  // Function to get appropriate icon based on zone name
  const getZoneIcon = (zoneName) => {
    const iconProps = { className: "w-6 h-6 text-current", strokeWidth: 1.5 }; // Added text-current for theming

    if (zoneName.includes("Command") || zoneName.includes("Control"))
      return <Radar {...iconProps} />;
    if (zoneName.includes("Storage") || zoneName.includes("Cargo"))
      return <Satellite {...iconProps} />;
    if (zoneName.includes("External")) return <Orbit {...iconProps} />;
    if (zoneName.includes("Communication")) return <Radio {...iconProps} />;
    if (zoneName.includes("Alert") || zoneName.includes("Emergency"))
      return <AlertCircle {...iconProps} />; // Error/Alert icons might have specific colors later
    if (zoneName.includes("Signal") || zoneName.includes("Transmission"))
      return <Wifi {...iconProps} />;

    return <Rocket {...iconProps} />;
  };

  // GSAP Star animation useEffect is removed

  // Initialize zones with API data
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get(
          "https://phydra.onrender.com/api/get-zones",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const data = response.data;

        if (data.Response === "SUCCESS" && Array.isArray(data.zones)) {
          let matchedZones = data.zones.map((zoneName, index) => {
            if (index < 16 && staticZones[index]) {
              return staticZones[index];
            }
            return {
              name: zoneName,
              imageUrl: staticZones[15].imageUrl,
              moduleId: `ISS-${index + 1}`,
              temperature: "21.0°C",
              pressure: "182.0 kPa",
              oxygenLevel: "28.0%",
              status: "Nominal",
            };
          });

          setZones(matchedZones);
          setZoneData(
            matchedZones.map((zone) => ({
              zoneName: zone.name,
              zoneImgUrl: zone.imageUrl,
            }))
          );
        }
        setLoading(false);
      } catch (error) {
        console.warn("Error fetching zones, using default 16 zones:", error);
        const default16Zones = staticZones.slice(0, 16);
        setZones(default16Zones);
        setZoneData(
          default16Zones.map((zone) => ({
            zoneName: zone.name,
            zoneImgUrl: zone.imageUrl,
          }))
        );
        setLoading(false);
      }
    };

    fetchZones();
  }, [setZoneData]);

  // Animate cards when they load
  useEffect(() => {
    // GSAP Card loading animation useEffect is removed. Staggering will be handled by Framer Motion variants.
  }, [loading, zones]);

  // GSAP generateStars function is removed. Stars will be generated directly in ModalContent with Framer Motion.

  const listVariants = { // For staggering ZoneCard appearance
    visible: { transition: { staggerChildren: 0.1 } }, // Adjusted stagger to 0.1 per requirement
    hidden: {},
  };

  return (
    <div className="h-full min-w-screen bg-transparent text-text-main py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ISS orbit path */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-accent-pink/10 rounded-full opacity-20 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-accent-pink-light/10 rounded-full opacity-20 z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center mb-4">
            <Rocket className="w-8 h-8 mr-3 text-accent-pink" /> {/* Verified: uses theme color */}
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-accent-red to-accent-pink-light text-transparent bg-clip-text"> {/* Verified: uses theme colors */}
                ISS Zones Monitor
              </span>
            </h1>
          </div>
          <div className="text-text-main text-center max-w-2xl">
            <p className="text-sm md:text-base">
              Real-time monitoring system for International Space Station
              modules and zones
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-text-muted"> {/* text-text-muted for less emphasis */}
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></div> {/* green-400 is fine for status */}
                <span>Systems Online</span>
              </div>
              <div className="w-px h-4 bg-accent-pink/30"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-accent-pink mr-1.5"></div>
                <span>Orbit: LEO</span>
              </div>
              <div className="w-px h-4 bg-accent-pink/30"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-accent-pink-light mr-1.5"></div>
                <span>Altitude: 408 km</span>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Loading and Error Handling */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-accent-pink"> {/* Themed loader text */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-accent-pink/20 border-t-accent-pink animate-spin"></div>
              <div className="absolute inset-3 rounded-full border-2 border-accent-pink-light/20 border-b-accent-pink-light animate-spin animation-delay-150"></div>
            </div>
            <div className="ml-4 mt-4 text-lg"> {/* Adjusted margin and text size */}
              Establishing connection...
            </div>
          </div>
        ) : error ? (
          <div className="bg-accent-red/10 text-accent-red p-6 rounded-lg text-center border border-accent-red/30 max-w-md mx-auto shadow-lg"> {/* Themed error box */}
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-accent-red" /> {/* Verified: uses theme color */}
            <h3 className="text-xl font-semibold mb-2 text-text-main">Connection Error</h3> {/* Verified: uses theme color */}
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-3 text-accent-red/80">
              Try reestablishing connection to ISS systems.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr"
            layout
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence> 
              {zones.map((zone) => ( 
                <ZoneCard
                  key={zone.name}
                  zone={zone}
                  icon={getZoneIcon(zone.name)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ZoneCard({ zone, icon, index }) {
  const {
    name,
    imageUrl,
    moduleId,
    temperature,
    pressure,
    oxygenLevel,
    status,
  } = zone;
  const statusColor =
    status === "Nominal" ? "text-green-400" : "text-yellow-400"; // Status colors can remain specific for clarity
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const starsRef = useRef(null); // GSAP ref removed

  // GSAP Star Animation useEffect is removed.

  const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 }, // Slightly adjusted initial state
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }, // Slightly faster animation
    },
    exit: { // Exit animation can be kept if AnimatePresence is used on the list directly
      opacity: 0,
      y: -30, // Exit upwards
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" },
    },
    hover: { scale: 1.04, transition: { duration: 0.2, type: "spring", stiffness: 300 } }, // Springy hover
  };

  const ModalContent = () => (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" // Darker backdrop, more blur
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} // Slightly different initial scale
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }} // Spring transition for modal
            className="bg-gradient-to-br from-nav-bg-start to-nav-bg-alt rounded-xl max-w-4xl w-full p-1 shadow-2xl" // Themed gradient and shadow
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-nav-bg-start/90 rounded-xl p-6 backdrop-blur-lg relative overflow-hidden"> {/* Adjusted padding, themed bg */}
              {/* Framer Motion Animated Stars Background */}
              <div className="absolute inset-0 z-0 overflow-hidden"> {/* Added overflow-hidden */}
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div
                    key={`star-${i}`} // Unique key for stars
                    className="absolute rounded-full bg-text-main" // Themed star color
                    style={{
                      width: `${Math.random() * 1.5 + 0.5}px`, 
                      height: `${Math.random() * 1.5 + 0.5}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0], scale: [1, 1.1, 1] }} // Adjusted opacity and scale per requirement
                    transition={{
                      duration: 2, // Fixed duration per requirement
                      repeat: Infinity,
                      delay: Math.random() * 2, // Random delay per requirement
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4"> 
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-accent-pink to-accent-pink-light bg-clip-text text-transparent"> {/* Verified: uses theme colors */}
                    {name}
                  </h2>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="text-accent-pink hover:text-accent-pink-light transition-colors p-1 rounded-full hover:bg-text-main/10" // Verified: themed button with hover effect
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9, rotate: 85 }} // Added a slightly different tap effect
                  >
                    <X className="w-6 h-6 text-current" /> {/* Ensured icon uses text-current */}
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <ContainerDashboard zoneName={name} zoneImgUrl={imageUrl} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.div
        className="rounded-xl overflow-hidden shadow-lg"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        layoutId={name} // Good for shared layout animations if modal was a direct transform
        whileHover="hover"
        whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400 } }} // Added whileTap
      >
        <div className="bg-gradient-to-br from-accent-pink to-accent-red p-0.5 rounded-xl shadow-lg"> {/* Themed gradient, added shadow */}
          <motion.div
            className="bg-nav-bg-start/90 backdrop-blur-md rounded-xl h-full flex flex-col" 
          >
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-40 object-cover rounded-t-xl" 
            />

            <div className="p-4 flex-grow"> 
              <div className="flex items-center justify-between mb-2"> 
                <h3 className="text-lg font-semibold text-accent-pink-light"> {/* Verified: theme color */}
                  {name.replace(/_/g, " ")}
                </h3>
                <div className="text-accent-pink">{icon}</div>{/* Verified: theme color */}
              </div>

              <div className="w-full h-px bg-gradient-to-r from-accent-red/50 to-accent-pink-light/50 rounded-full mb-3"></div> {/* Verified: theme colors */}

              <div className="flex-1 space-y-2 text-xs"> 
                <div className="flex justify-between items-center">
                  <span className="text-text-main/70">Module ID:</span>
                  <span className="font-mono text-accent-pink-light">{moduleId}</span> {/* Verified: theme colors */}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-main/70">Temperature:</span>
                  <span className="font-mono text-text-main">{temperature}</span> {/* Verified: theme color */}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-main/70">Pressure:</span>
                  <span className="font-mono text-text-main">{pressure}</span> {/* Verified: theme color */}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-main/70">Oxygen Level:</span>
                  <span className="font-mono text-text-main">{oxygenLevel}</span> {/* Verified: theme color */}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-main/70">Status:</span>
                  <span className={`font-mono ${statusColor}`}>{status}</span> {/* Status color logic is fine */}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-3 border-t border-accent-pink/20 flex justify-between items-center p-4"> {/* Verified: theme color */}
              <div className="flex items-center text-xs text-text-muted"> 
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === "Nominal" ? "bg-green-400" : "bg-yellow-400" 
                  } mr-1.5`}
                ></div>
                <span>{status} Report</span>
              </div>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-accent-red to-accent-pink text-text-main text-xs font-semibold py-1.5 px-3 rounded-full shadow-md" // Verified: theme colors
                whileHover={{ scale: 1.05, filter: "brightness(1.15)" }} // Adjusted brightness
                whileTap={{ scale: 0.95, filter: "brightness(0.9)" }} // Adjusted brightness
                transition={{ type: "spring", stiffness: 400, damping: 15 }} // Adjusted spring
              >
                Details
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <ModalContent />
    </>
  );
}
