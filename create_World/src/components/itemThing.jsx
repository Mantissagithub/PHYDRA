import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import gsap from "gsap";
import { X } from "lucide-react";

const ItemDashboard = ({ containerIdx, zoneName }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dashboardRef = useRef(null);

  // GSAP animation for the dashboard container
  useEffect(() => {
    gsap.from(dashboardRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/get-items", {
        params: { containerId: containerIdx },
        headers: { "Content-Type": "application/json" },
      });

      if (response.data?.Response === "Success") {
        setItems(response.data.items || []);
      } else {
        setError("Container not found or empty");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!containerIdx) {
      setError("No container ID provided");
      return;
    }
    fetchItems();
  }, [containerIdx]);

  // Framer Motion animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05 },
  };

  return (
    <div
      ref={dashboardRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white"
    >
      <div className="max-w-4xl w-full p-6 bg-gray-800 rounded-xl shadow-lg relative">
        {/* Close Button */}
        <button className="absolute top-4 right-4 p-2 bg-gray-700 rounded-full hover:bg-red-500 transition-all">
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-wide text-pink-400">
            🚀 Container Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Real-time monitoring system for International Space Station containers.
          </p>
        </div>

        {/* Zone Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-700 p-4 rounded-lg shadow-md flex items-center space-x-4">
            <img
              src="/zone-placeholder.jpg"
              alt="Zone"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">Zone: {zoneName}</h2>
              <p className="text-sm text-gray-400">Container ID: {containerIdx}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {items.map((itemId) => (
              <motion.div
                key={itemId}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="bg-gray-700 p-4 rounded-lg shadow-md hover:ring hover:ring-pink-500 transition-all cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-pink-400">Item ID</h3>
                <p className="text-sm text-gray-300">{itemId}</p>
                <button
                  onClick={() => alert(`Viewing details for item ${itemId}`)}
                  className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all"
                >
                  View Details
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ItemDashboard;
