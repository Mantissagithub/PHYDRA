import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Info, AlertCircle } from "lucide-react";

const ItemDashboard = ({ containerIdx }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemDetails, setItemDetails] = useState({});
  const [selectedItemId, setSelectedItemId] = useState(null); // Track the selected item
  const dashboardRef = useRef(null);

  // GSAP animation setup
  useEffect(() => {
    if (dashboardRef.current) {
      gsap.from(dashboardRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/get-items", {
        params: { containerId: containerIdx },
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.Response === "Success") {
        setItems(response.data.items);
      } else {
        setError("Container not found or empty");
      }
    } catch (error) {
      setError("Failed to connect to server");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const retrieveItemData = async (itemId) => {
    try {
      const response = await axios.get("http://localhost:5000/api/getItemData", {
        params: { itemId },
      });

      if (response.data.Response === "Success") {
        setItemDetails((prev) => ({
          ...prev,
          [itemId]: response.data.Item,
        }));
        setSelectedItemId(itemId); // Set the selected item ID

        // Animate details panel
        gsap.from(`#details-${itemId}`, {
          opacity: 0,
          x: -20,
          duration: 0.4,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const closeDetails = () => {
    setSelectedItemId(null); // Close the currently open details
  };

  useEffect(() => {
    if (!containerIdx) {
      setError("No container ID provided");
      return;
    }
    fetchItems();
  }, [containerIdx]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div
      ref={dashboardRef}
      className="p-6 bg-gray-50 min-h-screen"
      onClick={closeDetails} // Close details when clicking outside
    >
      <h2 className="text-3xl font-bold text-blue-600 mb-8">
        Item Management Dashboard
      </h2>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      )}

      <AnimatePresence>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.itemId}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              >
                <div className="flex items-center">
                  <Info className="text-blue-500 mr-3" />
                  <div>
                    <span className="block font-mono text-gray-700">
                      {item.itemId}
                    </span>
                    <span className="block text-sm text-gray-500">
                      {item.itemName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => retrieveItemData(item.itemId)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                >
                  Retrieve Data
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="mt-8 space-y-6">
        {selectedItemId && itemDetails[selectedItemId] && (
          <div
            id={`details-${selectedItemId}`}
            className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-blue-500"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Item Details: {selectedItemId}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem
                label="Name"
                value={itemDetails[selectedItemId].name}
              />
              <DetailItem
                label="Dimensions"
                value={`${itemDetails[selectedItemId].width} × ${itemDetails[selectedItemId].depth} × ${itemDetails[selectedItemId].height} cm`}
              />
              <DetailItem
                label="Mass"
                value={`${itemDetails[selectedItemId].mass} kg`}
              />
              <DetailItem
                label="Priority"
                value={itemDetails[selectedItemId].priority}
              />
              <DetailItem
                label="Expiry Date"
                value={new Date(
                  itemDetails[selectedItemId].expiryDate
                ).toLocaleDateString()}
              />
              <DetailItem
                label="Usage Limit"
                value={itemDetails[selectedItemId].usageLimit}
              />
              <DetailItem
                label="Preferred Zone"
                value={itemDetails[selectedItemId].preferredZone}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <span className="block text-sm font-medium text-gray-500">{label}</span>
    <span className="block mt-1 text-gray-800">{value || "-"}</span>
  </div>
);

export default ItemDashboard;