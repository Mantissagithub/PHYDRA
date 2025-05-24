import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion"; // Added Framer Motion imports

const ItemDashboard = ({ containerIdx }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get("https://phydra.onrender.com/api/get-items", {
        params: { containerId: containerIdx },
      });
      console.log("API Response:", response.data); // Debug response
      if (response.data.Response === "Success") {
        if (Array.isArray(response.data.items)) {
          setItems(response.data.items);
          if (response.data.items.length === 0) {
            setError("No items in container");
          }
        } else {
          console.error("Items is not an array:", response.data.items);
          setError("Invalid data format received");
        }
      } else {
        setError("Failed to fetch items");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const retrieveItemData = async (itemId) => {
    try {
      const response = await axios.get(
        "https://phydra.onrender.com/api/getItemData",
        {
          params: { itemId },
        }
      );
      console.log("Item details response:", response.data);

      if (response.data.Response === "Success") {
        setItemDetails(response.data.Item);
        setSelectedItem(itemId);
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
    }
  };

  const toggleItemDetails = (itemId) => {
    if (selectedItem === itemId) {
      // If clicking on already selected item, hide details
      setSelectedItem(null);
      setItemDetails(null);
    } else {
      // If clicking on new item, fetch its details
      retrieveItemData(itemId);
    }
  };

  useEffect(() => {
    console.log("Container ID:", containerIdx); // Debug containerIdx
    if (containerIdx) fetchItems();
  }, [containerIdx]);

  // Debug render
  console.log("Current items:", items);
  console.log("Loading:", loading);
  console.log("Error:", error);

  if (loading)
    return <div className="text-text-main text-center p-4">Loading items...</div>; // Themed loading text
  if (error) return <div className="text-accent-red text-center p-4 bg-accent-red/10 rounded-md">{error}</div>; // Themed error text

  const listVariants = {
    visible: { transition: { staggerChildren: 0.07 } },
    hidden: { opacity: 0 }, 
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="bg-nav-bg-start p-3 rounded-lg w-full max-h-[500px]"> {/* Themed background, adjusted padding */}
      <h2 className="text-lg text-text-main font-bold mb-2 px-1"> {/* Themed title, adjusted padding */}
        Items in Container {containerIdx}
      </h2>

      <motion.div 
        layout 
        variants={listVariants} 
        initial="hidden" 
        animate="visible" 
        className="space-y-2 overflow-y-auto max-h-[calc(500px-60px)] pr-1" // Adjusted max-h & spacing, pr for scrollbar
      >
        {items.map((item) => (
          <motion.div
            layout
            key={item.itemId}
            variants={itemVariants} // Apply item variants here
            // initial, animate, exit will be handled by listVariants through itemVariants
            className="bg-accent-pink rounded-lg p-2.5 shadow-sm" // Themed item bg, adjusted padding, added shadow
          >
            <div className="flex justify-between items-center">
              <div className="text-nav-bg-start min-w-0 flex-1 mr-2"> {/* Themed text */}
                <div className="font-semibold text-sm truncate"> {/* Increased font weight */}
                  {item.itemName}
                </div>
                <div className="text-xs opacity-80">ID: {item.itemId}</div> {/* Increased opacity */}
              </div>
              <motion.button
                onClick={() => toggleItemDetails(item.itemId)}
                className="px-2.5 py-1 bg-nav-bg-start text-text-main text-xs rounded-md hover:bg-nav-bg-alt whitespace-nowrap" // Themed button, adjusted padding & rounding
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 26, 60, 0.9)' /* nav-bg-alt with custom opacity */ }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedItem === item.itemId ? "Hide" : "View"}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {selectedItem === item.itemId && itemDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-2 pt-2 border-t border-nav-bg-start/20" // Themed border, adjusted opacity
                >
                  {/* Responsive grid for item details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-nav-bg-start"> {/* Adjusted gaps, themed text */}
                    <div className="flex items-center">
                      <span className="opacity-75 mr-1">Mass:</span>
                      <span className="font-medium">{itemDetails.mass}kg</span> {/* Added font-medium */}
                    </div>
                    <div className="flex items-center">
                      <span className="opacity-75 mr-1">Priority:</span>
                      <span className="font-medium">{itemDetails.priority}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="opacity-75 mr-1">Usage:</span>
                      <span className="font-medium">{itemDetails.usageLimit}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="opacity-75 mr-1">Zone:</span>
                      <span className="font-medium truncate">{itemDetails.preferredZone}</span> {/* Added truncate */}
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex items-center"> {/* Ensure full span on small, then adjust */}
                      <span className="opacity-75 mr-1">Size:</span>
                      <span className="font-medium">
                        {itemDetails.width}×{itemDetails.depth}×
                        {itemDetails.height}cm
                      </span>
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex items-center">
                      <span className="opacity-75 mr-1">Expires:</span>
                      <span className="font-medium">
                        {new Date(itemDetails.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {items.length === 0 && !loading && ( // Ensure not to show "No items" when loading
          <div className="text-text-main text-center py-3 text-xs bg-nav-bg-alt rounded-lg shadow-inner"> {/* Themed message, added shadow */}
            No items found in this container.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ItemDashboard;
