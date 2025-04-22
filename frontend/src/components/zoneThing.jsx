import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
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
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedZoneData, setSelectedZoneData] = useState(null);
  const cardsRef = useRef(null);
  const starsRef = useRef(null);

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
    const iconProps = { className: "w-6 h-6", strokeWidth: 1.5 };

    if (zoneName.includes("Command") || zoneName.includes("Control"))
      return <Radar {...iconProps} />;
    if (zoneName.includes("Storage") || zoneName.includes("Cargo"))
      return <Satellite {...iconProps} />;
    if (zoneName.includes("External")) return <Orbit {...iconProps} />;
    if (zoneName.includes("Communication")) return <Radio {...iconProps} />;
    if (zoneName.includes("Alert") || zoneName.includes("Emergency"))
      return <AlertCircle {...iconProps} />;
    if (zoneName.includes("Signal") || zoneName.includes("Transmission"))
      return <Wifi {...iconProps} />;

    return <Rocket {...iconProps} />;
  };

  // Create animated stars in the background
  useEffect(() => {
    if (starsRef.current) {
      const stars = starsRef.current.children;
      gsap.to(stars, {
        opacity: 0.8,
        stagger: 0.05,
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
        repeatDelay: 0.5,
      });
    }
  }, []);

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
    if (!loading && zones.length > 0 && cardsRef.current) {
      const cards = cardsRef.current.children;
      gsap.fromTo(
        cards,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
        }
      );
    }
  }, [loading, zones]);

  // Generate random stars for background
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      const size = Math.random() * 2 + 1;
      stars.push(
        <div
          key={i}
          className="absolute rounded-full bg-white opacity-0"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="h-full min-w-screen bg-transparent text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ISS orbit path */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-[#f48599]/10 rounded-full opacity-20 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-[#f8b4c0]/10 rounded-full opacity-20 z-0"></div>

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
                ISS Zones Monitor
              </span>
            </h1>
          </div>
          <div className="text-[#e6e6e6] text-center max-w-2xl">
            <p className="text-sm md:text-base">
              Real-time monitoring system for International Space Station
              modules and zones
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></div>
                <span>Systems Online</span>
              </div>
              <div className="w-px h-4 bg-[#f48599]/30"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#f48599] mr-1"></div>
                <span>Orbit: LEO</span>
              </div>
              <div className="w-px h-4 bg-[#f48599]/30"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#f8b4c0] mr-1"></div>
                <span>Altitude: 408 km</span>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Loading and Error Handling */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#f48599]/20 border-t-[#f48599]  animate-spin"></div>
              <div className="absolute inset-3 rounded-full border-2 border-[#f8b4c0]/20 border-b-[#f8b4c0] animate-spin animation-delay-150"></div>
            </div>
            <div className="ml-4 text-[#f48599]">
              Establishing connection...
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 text-red-200 p-6 rounded-lg text-center border border-red-500/30 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-1">Connection Error</h3>
            <p>{error}</p>
            <p className="text-xs mt-2 text-red-300">
              Try reestablishing connection to ISS systems
            </p>
          </div>
        ) : (
          <motion.div
            ref={cardsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr"
            layout
          >
            <AnimatePresence>
              {zones.map((zone, index) => (
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
    status === "Nominal" ? "text-green-400" : "text-yellow-400";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const starsRef = useRef(null);

  // GSAP Star Animation
  useEffect(() => {
    if (isModalOpen && starsRef.current) {
      const stars = starsRef.current.children;
      gsap.to(stars, {
        opacity: 0.8,
        stagger: 0.05,
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
      });
    }
  }, [isModalOpen]);

  const cardVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.9,
      transition: { duration: 0.3, ease: "easeIn" },
    },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const ModalContent = () => (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-[#15112b] to-[#2a2356] rounded-xl max-w-4xl w-full p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#15112b]/90 rounded-xl p-6 backdrop-blur-lg relative overflow-hidden h-[px]">
              {/* Animated Stars Background */}
              <div ref={starsRef} className="absolute inset-0 z-0">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white opacity-0"
                    style={{
                      width: `${Math.random() * 2 + 1}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#f48599] to-[#f8b4c0] bg-clip-text text-transparent">
                    {name}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-[#f48599] hover:text-[#f8b4c0] transition-colors"
                  >
                    <X className="w-6 h-6" />
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
        layoutId={name}
        whileHover="hover"
      >
        <div className="bg-gradient-to-br from-[#f48599] to-[#f05672] p-0.5 rounded-xl">
          <motion.div
            className="bg-[#15112b]/90 backdrop-blur-sm rounded-xl h-full flex flex-col"
            whileHover={{
              backgroundColor: "rgba(21, 17, 43, 0.7)",
              transition: { duration: 0.3 },
            }}
          >
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-48 object-cover rounded-t-xl"
            />

            <div className="p-5 flex-grow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#f8b4c0]">
                  {name.replace(/_/g, " ")}
                </h3>
                <div className="text-[#f48599]">{icon}</div>
              </div>

              <div className="w-full h-1 bg-gradient-to-r from-[#f05672]/50 to-[#f8b4c0]/50 rounded-full mb-4"></div>

              <div className="flex-1 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#e6e6e6]/70">Module ID:</span>
                  <span className="font-mono text-[#f8b4c0]">{moduleId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#e6e6e6]/70">Temperature:</span>
                  <span className="font-mono">{temperature}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#e6e6e6]/70">Pressure:</span>
                  <span className="font-mono">{pressure}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#e6e6e6]/70">Oxygen Level:</span>
                  <span className="font-mono">{oxygenLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#e6e6e6]/70">Status:</span>
                  <span className={`font-mono ${statusColor}`}>{status}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f48599]/20 flex justify-between items-center p-5">
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === "Nominal" ? "bg-green-400" : "bg-yellow-400"
                  } mr-2`}
                ></div>
                <span className="text-xs">{status} Report</span>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-[#f05672] to-[#f8b4c0] text-white text-sm font-semibold py-2 px-4 rounded-full hover:opacity-80 transition-opacity"
              >
                Details
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <ModalContent />
    </>
  );
}
