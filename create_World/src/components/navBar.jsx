"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Upload,
  Calendar,
  X,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const [activeButton, setActiveButton] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState("");
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleButtonClick = (button) => {
    setActiveButton((prevButton) => (prevButton === button ? null : button));
  };

  const handleSimulateSubmit = () => {
    alert(`Simulating for ${numberOfDays} days`);
    setActiveButton(null);
  };

  return (
    <div className="w-full">
      <motion.div className="w-full flex justify-center p-4 bg-transparent sticky top-0 z-40 transition-all duration-300">
        <motion.nav
          ref={navRef}
          className={`flex flex-col w-full max-w-6xl transition-all duration-300 overflow-visible ${
            isScrolled
              ? "shadow-[0_8px_25px_rgba(240,86,114,0.15)]"
              : "shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main navigation bar */}
          <div className="flex items-center justify-between px-6 py-3 rounded-t-3xl border border-white/5 bg-gradient-to-r from-[#15112b]/70 to-[#1a1535]/70">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white font-bold text-xl relative group cursor-pointer"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f48599] to-[#f05672]">
                <img src="/logo.jpeg" alt="Logo" className="h-10 w-12" />
              </span>
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#f48599] to-[#f05672] group-hover:w-full"
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
              <NavButton
                onClick={() => handleButtonClick("simulate")}
                icon={<Calendar className="mr-2 h-5 w-5" />}
                text="Simulate Days"
                gradient="from-[#f48599] to-[#f05672]"
                isActive={activeButton === "simulate"}
              />

              <NavButton
                onClick={() => handleButtonClick("msgbox")}
                icon={<Mail className="mr-2 h-5 w-5" />}
                text="MsgBox"
                gradient="from-[#f05672] to-[#f48599]"
                isActive={activeButton === "msgbox"}
              />

              <NavButton
                onClick={() => handleButtonClick("upload")}
                icon={<Upload className="mr-2 h-5 w-5" />}
                text="Upload CSV"
                gradient="from-[#f48599] via-[#f05672] to-[#f48599]"
                isActive={activeButton === "upload"}
              />
            </div>
          </div>

          {/* Expandable content area */}
          <AnimatePresence>
            {activeButton && (
              <motion.div
                className="w-full bg-[#1a1535]/95 border-x border-b border-white/5 rounded-b-3xl overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="p-5 relative">
                  <motion.button
                    onClick={() => setActiveButton(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close panel"
                  >
                    <X size={16} />
                  </motion.button>

                  {activeButton === "simulate" && (
                    <SimulateDaysContent
                      numberOfDays={numberOfDays}
                      setNumberOfDays={setNumberOfDays}
                      onSubmit={handleSimulateSubmit}
                      gradient="from-[#f48599] to-[#f05672]"
                    />
                  )}

                  {activeButton === "msgbox" && <MsgBoxContent />}

                  {activeButton === "upload" && (
                    <UploadCSVContent gradient="from-[#f48599] via-[#f05672] to-[#f48599]" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </motion.div>
    </div>
  );
}

const NavButton = ({ onClick, icon, text, gradient, isActive }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center px-5 py-2.5 rounded-full bg-[#1a1535] text-white text-sm font-medium transition-all ${
        isActive ? "bg-opacity-80 ring-2 ring-white/20" : "hover:bg-opacity-70"
      }`}
      whileHover={{ scale: isActive ? 1 : 1.07 }}
      whileTap={{ scale: isActive ? 1 : 0.95 }}
      aria-expanded={isActive}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 hover:opacity-10 rounded-full`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.15 : 0 }}
        whileHover={{ opacity: 0.15 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="absolute -inset-px rounded-full opacity-0 hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(244, 133, 153, 0.3), transparent)`,
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["100% 0%", "-100% 0%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      <div className="relative z-10 flex items-center">
        {icon}
        {text}
      </div>
    </motion.button>
  );
};

// Modular content components
const SimulateDaysContent = ({
  numberOfDays,
  setNumberOfDays,
  onSubmit,
  gradient,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSimulate = async () => {
    if (
      !numberOfDays ||
      isNaN(parseInt(numberOfDays)) ||
      parseInt(numberOfDays) <= 0
    ) {
      setError("Please enter a valid number of days");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/simulate/day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numOfDays: parseInt(numberOfDays),
          itemsToBeUsedPerDay: [
            {
              itemId: "000037",
              name: "itemA", // Either of these
              itemsToBeUsedPerDay: 3,
            },
          ], // Add the required field, modify as needed based on your API requirements
        }),
      });

      const data = await response.json();
      console.log(data);

      if (!data.success) {
        throw new Error(data.message || "Failed to simulate days");
      }

      setSimulationResult(data);
    } catch (err) {
      setError(err.message || "Failed to connect to simulation server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto"></div>
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Calendar className="mr-2 h-5 w-5" />
        Simulate Days
      </h3>

      <div className="bg-[#15112b]/70 p-5 rounded-xl">
        <p className="text-white/80 mb-4">
          Enter the number of days to simulate and click Run to start the
          simulation process.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <label
              htmlFor="days-input"
              className="block text-sm font-medium text-white/80 mb-1.5"
            >
              Number of Days
            </label>
            <input
              id="days-input"
              type="number"
              placeholder="Enter days"
              className="px-4 py-2.5 rounded-lg text-black w-full sm:w-40 bg-white/90 focus:ring-2 focus:ring-[#f05672] focus:outline-none"
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(e.target.value)}
              aria-label="Number of days to simulate"
            />
          </div>
          <CustomButton
            onClick={handleSimulate}
            gradient={gradient}
            className="mt-6 sm:mt-0 py-2.5 px-6 sm:self-end"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Simulating...
              </span>
            ) : (
              <>
                <span>Run Simulation</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </CustomButton>
        </div>

        {error && (
          <motion.div
            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </p>
          </motion.div>
        )}

        {simulationResult && (
          <motion.div
            className="mt-6 bg-[#1a1535]/50 p-4 rounded-lg border border-white/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Simulation Results
            </h4>
            <p className="text-emerald-300 mb-2">
              New Date:{" "}
              {new Date(simulationResult.newDate).toLocaleDateString()}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#15112b]/70 p-3 rounded-lg">
                <p className="text-white font-medium mb-1">Items Expired</p>
                {simulationResult.changes.itemsExpired.length > 0 ? (
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                    {simulationResult.changes.itemsExpired.map((item) => (
                      <div
                        key={item.itemId}
                        className="text-sm bg-white/10 p-2 rounded"
                      >
                        <div className="text-red-300 font-medium">
                          {item.name}
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          ID: {item.itemId}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-sm">No items expired</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

const MsgBoxContent = () => {
  const messages = [
    {
      id: 1,
      text: "System update completed successfully",
      time: "10:30 AM",
      type: "success",
    },
    {
      id: 2,
      text: "New container added to inventory",
      time: "11:45 AM",
      type: "info",
    },
    {
      id: 3,
      text: "Warning: Low stock on item #A1234",
      time: "1:15 PM",
      type: "warning",
    },
    {
      id: 4,
      text: "Simulation completed for 5 days",
      time: "3:20 PM",
      type: "success",
    },
    {
      id: 5,
      text: "CSV import successful: 120 items added",
      time: "4:55 PM",
      type: "success",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Mail className="mr-2 h-5 w-5" />
        Message Box
      </h3>

      <div className="bg-[#15112b]/70 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <p className="text-white/80">Recent system messages</p>
          <span className="text-xs text-white/60">Today</span>
        </div>

        <div
          className="space-y-3 max-h-[300px] overflow-y-auto pr-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`p-3 rounded-lg flex items-start gap-3 ${
                message.type === "warning"
                  ? "bg-amber-500/10 border border-amber-500/30"
                  : message.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-white/10 border border-white/10"
              }`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: message.id * 0.05 }}
            >
              {message.type === "warning" && (
                <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              {message.type === "success" && (
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                </div>
              )}
              {message.type === "info" && (
                <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                </div>
              )}

              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-white">{message.time}</span>
                </div>
                <p className="mt-1 text-white/90">{message.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UploadCSVContent = ({ gradient }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event, endpoint) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    setError(null);
    setResponseMessage(null);

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setResponseMessage(
          `${response.data.containersImported || response.data.itemsImported} ${
            response.data.containersImported ? "containers" : "items"
          } imported successfully.`
        );
      } else {
        setError("Failed to import data. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Upload className="mr-2 h-5 w-5" />
        Upload CSV Files
      </h3>

      <div className="bg-[#15112b]/70 p-5 rounded-xl">
        <p className="text-white/80 mb-4">
          Upload CSV files to import containers and items into the system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1535]/50 p-4 rounded-lg border border-white/10">
            <h4 className="text-white font-medium mb-3">Containers</h4>
            <p className="text-white/70 text-sm mb-4">
              Import container data including IDs, dimensions, and locations.
            </p>

            <div className="relative">
              <input
                type="file"
                accept=".csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Upload containers CSV"
                onChange={(e) =>
                  handleFileUpload(
                    e,
                    "http://localhost:8000/api/import/containers"
                  )
                }
              />
              <CustomButton
                gradient={gradient}
                className="w-full py-3 justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select Containers CSV
                  </>
                )}
              </CustomButton>
            </div>
          </div>

          <div className="bg-[#1a1535]/50 p-4 rounded-lg border border-white/10">
            <h4 className="text-white font-medium mb-3">Items</h4>
            <p className="text-white/70 text-sm mb-4">
              Import item data including IDs, names, and quantities.
            </p>

            <div className="relative">
              <input
                type="file"
                accept=".csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Upload items CSV"
                onChange={(e) =>
                  handleFileUpload(e, "http://localhost:8000/api/import/items")
                }
              />
              <CustomButton
                gradient={gradient}
                className="w-full py-3 justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select Items CSV
                  </>
                )}
              </CustomButton>
            </div>
          </div>
        </div>

        {responseMessage && (
          <motion.div
            className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{responseMessage}</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

function CustomButton({ onClick, children, gradient, className = "" }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center justify-center px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all overflow-hidden ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
        initial={{ opacity: 0.9 }}
        whileHover={{ opacity: 1 }}
      />
      <motion.div
        className="absolute -inset-px rounded-lg opacity-0 hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)`,
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["100% 0%", "-100% 0%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      <div className="relative z-10 flex items-center">{children}</div>
    </motion.button>
  );
}