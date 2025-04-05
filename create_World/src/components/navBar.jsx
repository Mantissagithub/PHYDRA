"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Upload, Calendar, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [simulateDaysOpen, setSimulateDaysOpen] = useState(false);
  const [msgBoxOpen, setMsgBoxOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [modalPosition, setModalPosition] = useState(null);

  const handleOpenModal = (setOpen, buttonRef) => {
    const rect = buttonRef.current.getBoundingClientRect();
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + rect.width / 2,
    });
    setOpen(true);
  };

  const simulateDaysButtonRef = useRef(null);
  const msgBoxButtonRef = useRef(null);
  const uploadButtonRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.div
        className="w-full flex justify-center p-4 bg-transparent sticky top-0 z-40 transition-all duration-300"
      >
        <motion.nav
          className={`flex items-center justify-between px-6 py-3 rounded-3xl border border-white/5 bg-gradient-to-r from-[#15112b]/70 to-[#1a1535]/70 w-full max-w-6xl transition-all duration-300 ${
            isScrolled
              ? "shadow-[0_8px_25px_rgba(240,86,114,0.15)]"
              : "shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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

          <div className="flex items-center space-x-6">
            <NavButton
            ref={simulateDaysButtonRef}
            onClick={() => handleOpenModal(setSimulateDaysOpen, simulateDaysButtonRef)}
            icon={<Calendar className="mr-2 h-5 w-5" />}
              text="Simulate Days"
              gradient="from-[#f48599] to-[#f05672]"
            />

            <NavButton
                ref={msgBoxButtonRef}
                onClick={() => handleOpenModal(setMsgBoxOpen, msgBoxButtonRef)}
                icon={<Mail className="mr-2 h-5 w-5" />}
              text="MsgBox"
              gradient="from-[#f05672] to-[#f48599]"
            />

            <NavButton
                ref={uploadButtonRef}
                onClick={() => handleOpenModal(setUploadOpen, uploadButtonRef)}
                icon={<Upload className="mr-2 h-5 w-5" />}
              text="Upload CSV"
              gradient="from-[#f48599] via-[#f05672] to-[#f48599]"
            />
          </div>
        </motion.nav>
      </motion.div>

      {/* Simulate Days Modal */}
      <AnimatePresence>
        {simulateDaysOpen && (
          <Modal onClose={() => setSimulateDaysOpen(false)} position={modalPosition}>
            <div className="w-full max-w-md p-6 bg-gradient-to-br from-[#15112b] to-[#1a1535] rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Calendar className="mr-2 h-6 w-6 text-[#f48599]" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f48599] to-[#f05672]">
                  Simulate Days
                </span>
              </h2>
              <div className="mb-6">
                <label
                  htmlFor="days"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Number of days
                </label>
                <CustomInput
                  id="days"
                  type="number"
                  placeholder="Enter number of days"
                />
              </div>
              <CustomButton
                onClick={() => {}}
                gradient="from-[#f48599] to-[#f05672]"
                className="w-full"
              >
                <span>Submit</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </CustomButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* MsgBox Modal */}
      <AnimatePresence>
        {msgBoxOpen && (
          <Modal onClose={() => setMsgBoxOpen(false)} position={modalPosition}>
            <div className="w-full max-w-md p-6 bg-gradient-to-br from-[#15112b] to-[#1a1535] rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Mail className="mr-2 h-6 w-6 text-[#f48599]" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f48599] to-[#f05672]">
                  Recent Messages
                </span>
              </h2>
              <div className="max-h-60 overflow-y-auto bg-[#e6e6e6] rounded-xl shadow-inner">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className="p-3 border-b border-gray-300 hover:bg-white cursor-pointer relative overflow-hidden group"
                    whileHover={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="font-medium text-gray-800 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#f48599] to-[#f05672] flex items-center justify-center text-white mr-2">
                        {message.sender.charAt(0)}
                      </div>
                      {message.sender}
                    </div>
                    <div className="text-sm font-medium text-gray-700 ml-10">
                      {message.subject}
                    </div>
                    <div className="text-sm text-gray-600 truncate ml-10">
                      {message.preview}
                    </div>
                    <motion.div
                      className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#f48599] to-[#f05672] opacity-0 group-hover:opacity-100"
                      initial={{ scaleY: 0 }}
                      whileHover={{ scaleY: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <Modal onClose={() => setUploadOpen(false)} position={modalPosition} direction="right">
            <div className="w-full max-w-md p-6 bg-gradient-to-br from-[#15112b] to-[#1a1535] rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Upload className="mr-2 h-6 w-6 text-[#f05672]" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f48599] to-[#f05672]">
                  Upload CSV File
                </span>
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="containers"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Import Containers
                  </label>
                  <CustomFileInput
                    id="containers"
                    accept=".csv"
                    label="Choose file"
                  />
                </div>
                <div>
                  <label
                    htmlFor="items"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Import Items
                  </label>
                  <CustomFileInput id="items" accept=".csv" label="Choose file" />
                </div>
              </div>
              <CustomButton
                onClick={() => {}}
                gradient="from-[#f05672] to-[#f48599]"
                className="w-full"
              >
                <span>Submit</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </CustomButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// NavButton component
function NavButton({ onClick, icon, text, gradient }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center px-5 py-2.5 rounded-full bg-[#1a1535] text-white text-sm font-medium transition-all overflow-hidden`}
      whileHover={{
        scale: 1.07,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 hover:opacity-10`}
        initial={{ opacity: 0 }}
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
}

// Custom Button component
function CustomButton({ onClick, children, gradient, className = "" }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center justify-center px-5 py-2.5 rounded-full text-white text-sm font-medium transition-all overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
        initial={{ opacity: 0.9 }}
        whileHover={{ opacity: 1 }}
      />
      <motion.div
        className="absolute -inset-px rounded-full opacity-0 hover:opacity-100"
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

// Custom Input component
function CustomInput({ id, type, placeholder }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-[#1a1535]/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f48599]/50 transition-all"
      />
      <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r from-[#f48599]/5 to-[#f05672]/5 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
}

// Custom File Input component
function CustomFileInput({ id, accept, label }) {
  const [fileName, setFileName] = useState("No file chosen");
  const inputRef = useRef(null);

  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No file chosen");
    }
  };

  return (
    <div className="flex items-center">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <motion.button
        onClick={() => inputRef.current.click()}
        className="relative flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#1a1535] text-white text-sm font-medium transition-all overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#f48599]/20 to-[#f05672]/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        <span className="relative z-10">{label}</span>
      </motion.button>
      <span className="ml-3 text-sm text-gray-300 truncate max-w-[150px]">
        {fileName}
      </span>
    </div>
  );
}

// Modal component
function Modal({ children, onClose, position, direction = "up" }) {
    const variants = {
      hidden: {
        opacity: 0,
        y: direction === "up" ? 50 : 0,
        x: direction === "right" ? 50 : 0,
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          type: "spring",
          damping: 25,
          stiffness: 300,
        },
      },
      exit: {
        opacity: 0,
        y: direction === "up" ? 50 : 0,
        x: direction === "right" ? 50 : 0,
        transition: {
          duration: 0.2,
        },
      },
    };
  
    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
        style={{
          top: position?.top || "50%",
          left: position?.left || "50%",
          transform: position ? "translateY(0)" : "translate(-50%, -50%)",
        }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="z-10"
        >
          <div className="relative">
            <motion.button
              className="absolute -top-2 -right-2 p-1 rounded-full bg-gradient-to-r from-[#f05672] to-[#f48599] text-white z-10"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 10px rgba(240, 86, 114, 0.5)",
              }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
            >
              <X size={16} />
            </motion.button>
            {children}
          </div>
        </motion.div>
      </div>
    );
  }

// Sample messages data
const messages = [
  {
    sender: "John Doe",
    subject: "Weekly Report",
    preview:
      "Here's the weekly report you requested. The numbers look promising...",
  },
  {
    sender: "Jane Smith",
    subject: "Project Update",
    preview:
      "I've completed the first phase of the project. We're on track to meet...",
  },
  {
    sender: "Alex Johnson",
    subject: "Meeting Reminder",
    preview:
      "Just a reminder that we have a team meeting scheduled for tomorrow at 10 AM...",
  },
];
