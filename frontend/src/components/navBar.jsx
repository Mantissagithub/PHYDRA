"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
              ? "shadow-lg shadow-accent-pink/15" // Updated shadow
              : "shadow-md shadow-black/10" // Updated shadow
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main navigation bar */}
          <div className="flex items-center justify-between px-6 py-3 rounded-t-3xl border border-text-main/5 bg-gradient-to-r from-nav-bg-start/70 to-nav-bg-end/70">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-text-main font-bold text-xl relative group cursor-pointer"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-logo-start to-brand-logo-end">
                <motion.img 
                  src="/logo.jpeg" 
                  alt="Logo" 
                  className="h-12 w-auto p-1 will-change-filter transition-all duration-300 ease-in-out group-hover:drop-shadow-[0_0_8px_rgba(244,133,153,0.4)]" // Updated logo: h-12, p-1, Tailwind classes for filter/transition, theme-based drop shadow
                  whileHover={{ scale: 1.1 }} // Added specific hover to image itself if parent hover isn't enough
                />
              </span>
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-logo-start to-brand-logo-end group-hover:w-full"
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
              <NavButton
                onClick={() => handleButtonClick("simulate")}
                icon={<Calendar className="mr-2 h-5 w-5 text-current" />} 
                text="Simulate Days"
                gradient="from-accent-pink to-accent-red"
                isActive={activeButton === "simulate"}
              />

              <NavButton
                onClick={() => handleButtonClick("msgbox")}
                icon={<Mail className="mr-2 h-5 w-5 text-current" />}
                text="MsgBox"
                gradient="from-accent-red to-accent-pink"
                isActive={activeButton === "msgbox"}
              />

              <NavButton
                onClick={() => handleButtonClick("upload")}
                icon={<Upload className="mr-2 h-5 w-5 text-current" />}
                text="Upload CSV"
                gradient="from-accent-pink via-accent-red to-accent-pink"
                isActive={activeButton === "upload"}
              />
            </div>
          </div>

          {/* Expandable content area */}
          <AnimatePresence>
            {activeButton && (
              <motion.div
                className="w-full bg-nav-bg-end/95 border-x border-b border-text-main/5 rounded-b-3xl overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="p-5 relative">
                  <motion.button
                    onClick={() => setActiveButton(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-text-main/10 hover:bg-text-main/20 text-text-main"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(230, 230, 230, 0.25)' }} // text-main is #e6e6e6
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close panel"
                  >
                    <X size={16} className="text-current" />
                  </motion.button>

                  {activeButton === "simulate" && (
                    <SimulateDaysContent
                      numberOfDays={numberOfDays}
                      setNumberOfDays={setNumberOfDays}
                      // onSubmit is not directly used by SimulateDaysContent, handleSimulate is used internally
                      gradient="from-accent-pink to-accent-red"
                    />
                  )}

                  {activeButton === "msgbox" && <MsgBoxContent />}

                  {activeButton === "upload" && (
                    <UploadCSVContent gradient="from-accent-pink via-accent-red to-accent-pink" />
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
      className={`relative flex items-center px-5 py-2.5 rounded-full bg-nav-bg-alt text-text-main text-sm font-medium transition-all ${
        isActive ? "bg-opacity-80 ring-2 ring-text-main/20" : "hover:bg-opacity-70"
      }`}
      whileHover={{ scale: isActive ? 1.02 : 1.07, filter: isActive ? 'brightness(1.1)' : 'brightness(1.2)'}}
      whileTap={{ scale: isActive ? 0.98 : 0.95 }}
      aria-expanded={isActive}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 rounded-full`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.25 : 0 }} // Increased opacity for active state
        whileHover={{ opacity: isActive ? 0.3 : 0.2 }} // Adjusted hover opacity
        transition={{ duration: 0.3 }}
      />
      {/* Removed the animated gradient border as it might be too distracting, can be added back if desired */}
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
      setError("Please enter a valid number of days (must be > 0).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSimulationResult(null); 

    try {
      const response = await fetch("https://phydra.onrender.com/api/simulate/day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numOfDays: parseInt(numberOfDays),
          itemsToBeUsedPerDay: [ 
            {
              itemId: "000037", 
              name: "itemA", 
              itemsToBeUsedPerDay: 3,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) { 
        throw new Error(data.message || `API Error: ${response.status}`);
      }

      setSimulationResult(data);
    } catch (err) {
      console.error("Simulation API error:", err); 
      setError(err.message || "Failed to connect to simulation server. Please check your connection or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h3 className="text-xl font-semibold text-text-main mb-4 flex items-center">
        <Calendar className="mr-2 h-5 w-5 text-current" /> 
        Simulate Days
      </h3>

      <div className="bg-nav-bg-start/70 p-5 rounded-xl">
        <p className="text-text-muted mb-4 text-sm"> 
          Enter the number of days to simulate and click "Run Simulation" to see the projected changes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-end"> {/* Changed items-start to items-end for better alignment with button */}
          <div className="w-full sm:w-auto flex-grow"> {/* Added flex-grow for input to take available space */}
            <label
              htmlFor="days-input"
              className="block text-sm font-medium text-text-muted mb-1.5"
            >
              Number of Days
            </label>
            <motion.input
              id="days-input"
              type="number"
              placeholder="E.g., 7"
              className="px-4 py-2.5 rounded-lg text-text-dark w-full bg-text-main/90 focus:ring-2 focus:ring-accent-red focus:outline-none border border-transparent placeholder-text-dark/50" // Removed sm:w-40 to allow flex-grow
              value={numberOfDays}
              onChange={(e) => {
                setNumberOfDays(e.target.value);
                if (error) setError(null); 
              }}
              aria-label="Number of days to simulate"
              whileFocus={{ scale: 1.03, borderColor: 'rgba(240, 86, 114, 1)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          </div>
          <CustomButton
            onClick={handleSimulate} 
            gradient={gradient}
            className="py-2.5 px-6 h-[46px]" // Removed mt-auto, sm:mt-0, sm:self-end as items-end on parent handles alignment
            disabled={isLoading || !numberOfDays || parseInt(numberOfDays) <= 0} 
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-text-main" 
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
                <ChevronRight className="ml-1 h-4 w-4 text-current" />
              </>
            )}
          </CustomButton>
        </div>

        {error && (
          <motion.div
            className="mt-4 p-3 bg-accent-red/20 border border-accent-red/30 rounded-lg text-text-main" 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="flex items-center text-sm"> 
              <AlertCircle className="h-4 w-4 mr-2 text-accent-red" /> 
              {error}
            </p>
          </motion.div>
        )}

        {simulationResult && !error && ( 
          <motion.div
            className="mt-6 bg-nav-bg-end/50 p-4 rounded-lg border border-text-main/20" 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="text-text-main font-semibold text-md mb-3 flex items-center"> {/* Changed font-medium to font-semibold, text-md */}
              <Calendar className="mr-2 h-4 w-4 text-current" /> 
              Simulation Results
            </h4>
            <p className="text-accent-pink-light mb-2 text-sm"> {/* Added text-sm */}
              New Date:{" "}
              {new Date(simulationResult.newDate).toLocaleDateString()}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-nav-bg-start/70 p-3 rounded-lg">
                <p className="text-text-main font-semibold text-sm mb-1.5"> {/* Changed font-medium to font-semibold, text-sm, mb-1.5 */}
                  Items Expired
                </p>
                {simulationResult.changes.itemsExpired.length > 0 ? (
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto p-1">  {/* Reduced max-h for better fit */}
                    {simulationResult.changes.itemsExpired.map((item) => (
                      <div
                        key={item.itemId}
                        className="text-sm bg-text-main/10 p-2 rounded"
                      >
                        <div className="text-accent-red font-medium"> 
                          {item.name}
                        </div>
                        <div className="text-xs text-text-muted mt-1"> 
                          ID: {item.itemId}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">No items expired during this simulation.</p> {/* Updated color and text */}
                )}
              </div>
              {/* Add more sections for other simulation changes if necessary */}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

const MsgBoxContent = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios({
        method: "get",
        url: "https://phydra.onrender.com/api/get-logs",
        timeout: 5000, 
      });

      if (data?.success && Array.isArray(data.logs)) { // More robust check
        setLogs(data.logs);
      } else {
        // If data.logs is not an array or success is false, treat as an error or empty logs
        setLogs([]); 
        if (!data?.success) throw new Error(data?.message || "Invalid response from server: Logs not found.");
      }
    } catch (err) {
      console.error("Fetch logs error:", err);
      setError(err.message || "Could not load logs. Please try again.");
      setLogs([]); // Ensure logs are cleared on error
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // formatDetails seems unused, consider removing if not needed elsewhere
  // const formatDetails = (details) => { ... };

  useEffect(() => {
    fetchLogs();
    // Cleanup function for when component unmounts or fetchLogs changes
    return () => {
      setLogs([]); // Clear logs
      setIsLoading(false); // Reset loading state
      setError(null); // Reset error state
    };
  }, [fetchLogs]);

  // Removed redundant useEffect for cleanup as it's handled above.

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-main"></div> {/* Spinner color */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-accent-red/20 rounded-lg text-center"> {/* Centered text */}
        <p className="text-text-main mb-3">{error}</p> {/* Error message color */}
        <CustomButton
          onClick={fetchLogs}
          gradient="from-accent-pink to-accent-red" // Use theme gradient
          className="py-2 px-4 text-sm" // Adjusted padding and text size
        >
          Try Again
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-text-main flex items-center">
          <Mail className="mr-2 h-5 w-5 text-current" /> {/* Icon color */}
          Message Box
        </h3>
        <button
          onClick={() => { fetchLogs(); setIsLoading(true);}} 
          className="px-3 py-1.5 text-sm bg-text-main/10 hover:bg-text-main/20 rounded-lg text-text-main transition-colors flex items-center"
          disabled={isLoading} 
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      <div className="bg-nav-bg-start/70 p-5 rounded-xl space-y-3 max-h-[500px] overflow-y-auto"> 
        {logs.length === 0 ? (
          <p className="text-text-muted text-center py-8">No logs available at the moment.</p> 
        ) : (
          logs.map((log, idx) => (
            <motion.div
              key={`${log.timestamp}-${idx}-${log.actionType}`} 
              className="p-3 rounded-lg bg-text-main/5 border border-text-main/10 shadow-sm" 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200, damping: 20 }} 
            >
              <div className="flex justify-between items-center text-xs mb-1.5"> 
                <span className="text-text-muted"> 
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                {log.userId && (
                  <span className="text-text-muted px-1.5 py-0.5 bg-primary-dark/50 rounded text-xs">User: {log.userId}</span>
                )}
              </div>
              <p className="text-sm text-text-main"> 
                <span
                  className={`font-medium ${ 
                    log.actionType?.includes("ERROR")
                      ? "text-accent-red"
                      : log.actionType?.includes("WARNING")
                      ? "text-yellow-400" 
                      : "text-accent-pink-light" 
                  }`}
                >
                  {log.actionType || "LOG"} 
                </span>
                {log.itemId && (
                  <span className="text-text-muted ml-2">(Item: {log.itemId})</span> 
                )}
              </p>
              {/* Consider rendering log.details if it exists and is simple */}
              {/* {log.details && <p className="text-xs text-text-muted mt-1">{formatDetails(log.details)}</p>} */}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const UploadCSVContent = ({ gradient }) => {
  const [isLoading, setIsLoading] = useState(false); // Consider separate loading states if uploads can be parallel
  const [responseMessage, setResponseMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event, endpoint, type) => { // Added 'type' for specific messaging
    const file = event.target.files[0];
    if (!file) return;

    // Basic CSV type check (client-side)
    if (!file.name.endsWith('.csv') || file.type !== 'text/csv') {
        setError(`Invalid file type for ${type}. Please upload a .csv file.`);
        event.target.value = null; // Clear the file input
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true); // Set general loading state
    setError(null);
    setResponseMessage(null);

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000, // Increased timeout for file uploads
      });

      if (response.data.success) {
        const count = response.data.containersImported || response.data.itemsImported || 0;
        setResponseMessage(
          `${count} ${type} imported successfully from ${file.name}.`
        );
      } else {
        setError(response.data.message || `Failed to import ${type}. Please check the file format or try again.`);
      }
    } catch (err) {
      console.error(`Upload error for ${type}:`, err);
      let errorMessage = `Failed to upload ${type}.`;
      if (err.code === 'ECONNABORTED') {
        errorMessage = `Upload timed out for ${type}. Please try again.`;
      } else if (err.response) {
        errorMessage = `Server error for ${type}: ${err.response.data?.message || err.response.status}`;
      } else if (err.request) {
        errorMessage = `Network error for ${type}. Please check your connection.`;
      } else {
        errorMessage = err.message || `An unknown error occurred during ${type} upload.`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      event.target.value = null; // Clear the file input regardless of outcome
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold text-text-main mb-4 flex items-center">
        <Upload className="mr-2 h-5 w-5 text-current" /> {/* Icon color */}
        Upload CSV Files
      </h3>

      <div className="bg-nav-bg-start/70 p-5 rounded-xl">
        <p className="text-text-muted mb-6 text-sm"> {/* Adjusted text color and size */}
          Select the appropriate CSV file for containers or items to import them into the system. Ensure files are correctly formatted.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Containers Upload */}
          <div className="bg-nav-bg-end/50 p-4 rounded-lg border border-text-main/10">
            <h4 className="text-text-main font-medium mb-2">Containers CSV</h4>
            <p className="text-text-muted text-xs mb-3">
              Import container data (ID, dimensions, location, etc.).
            </p>

            <div className="relative">
              <motion.input
                type="file"
                accept=".csv"
                id="containers-csv-upload" // Added ID for label association
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Upload containers CSV"
                onChange={(e) =>
                  handleFileUpload(
                    e,
                    "https://phydra.onrender.com/api/import/containers",
                    "containers"
                  )
                }
                disabled={isLoading} // Disable input while loading
                key={responseMessage || error || 'containers-input'} // Force re-render to clear file
              />
              <CustomButton
                gradient={gradient}
                className="w-full py-3 justify-center"
                disabled={isLoading}
                onClick={() => document.getElementById('containers-csv-upload').click()} 
                isHtmlButton={true} 
              >
                {isLoading ? ( 
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4 text-current" /> {/* Ensure icon has text-current or specific color */}
                    Select Containers CSV
                  </>
                )}
              </CustomButton>
            </div>
          </div>

          {/* Items Upload */}
          <div className="bg-nav-bg-end/50 p-4 rounded-lg border border-text-main/10">
            <h4 className="text-text-main font-semibold text-md mb-2">Items CSV</h4> {/* font-semibold, text-md */}
            <p className="text-text-muted text-xs mb-3">
              Import item data (ID, name, quantity, expiry, etc.).
            </p>

            <div className="relative">
               <motion.input
                type="file"
                accept=".csv"
                id="items-csv-upload" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Upload items CSV"
                onChange={(e) =>
                  handleFileUpload(e, "https://phydra.onrender.com/api/import/items", "items")
                }
                disabled={isLoading}
                key={responseMessage || error || 'items-input'} 
              />
              <CustomButton
                gradient={gradient}
                className="w-full py-3 justify-center"
                disabled={isLoading}
                onClick={() => document.getElementById('items-csv-upload').click()}
                isHtmlButton={true}
              >
                {isLoading ? (
                  <span className="flex items-center">
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4 text-current" /> {/* Ensure icon has text-current or specific color */}
                    Select Items CSV
                  </>
                )}
              </CustomButton>
            </div>
          </div>
        </div>

        {responseMessage && (
          <motion.div
            className="mt-5 p-3 bg-accent-pink-light/20 border border-accent-pink-light/30 rounded-lg text-text-main text-sm" // Success color
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{responseMessage}</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="mt-5 p-3 bg-accent-red/20 border border-accent-red/30 rounded-lg text-text-main text-sm" 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-accent-red" />
                {error}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

function CustomButton({ onClick, children, gradient, className = "", disabled = false, isHtmlButton = false }) { 
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center justify-center px-5 py-2.5 rounded-lg text-text-main text-sm font-medium transition-all overflow-hidden ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { scale: 1.03, filter: 'brightness(1.1)' } : {}} 
      whileTap={!disabled ? { scale: 0.97 } : {}}      
      disabled={disabled}
      type={isHtmlButton ? "button" : "button"} 
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
        initial={{ opacity: 0.9 }}
        whileHover={!disabled ? { opacity: 1 } : {}} 
        style={{ opacity: disabled ? 0.7 : 0.9 }} 
      />
      {!disabled && (
        <motion.div
          className="absolute -inset-px rounded-lg opacity-0 hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(230, 230, 230, 0.15), transparent)`, // text-main is #e6e6e6
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["150% 0%", "-150% 0%"], 
          }}
          transition={{
            duration: 2, 
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      )}
      <div className="relative z-10 flex items-center">{children}</div>
    </motion.button>
  );
}
