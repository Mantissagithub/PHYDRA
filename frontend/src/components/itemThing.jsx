import React, { useEffect, useState } from "react";
import axios from "axios";

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
    return <div className="text-[#ffffff] text-center">Loading...</div>;
  if (error) return <div className="text-[#f05672] text-center">{error}</div>;

  return (
    <div className="bg-[#15112b] p-2 rounded-lg w-full max-h-[500px]">
      <h2 className="text-lg text-[#ffffff] font-bold mb-2 px-2">
        Items in Container {containerIdx}
      </h2>

      <div className="space-y-1.5 overflow-y-auto max-h-[400px] pr-2">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="bg-[#f48599] rounded-lg p-2 transition-all duration-200"
          >
            <div className="flex justify-between items-center">
              <div className="text-[#15112b] min-w-0 flex-1 mr-2">
                <div className="font-medium text-sm truncate">
                  {item.itemName}
                </div>
                <div className="text-xs opacity-75">ID: {item.itemId}</div>
              </div>
              <button
                onClick={() => toggleItemDetails(item.itemId)}
                className="px-2 py-1 bg-[#15112b] text-white text-xs rounded hover:bg-opacity-80 whitespace-nowrap"
              >
                {selectedItem === item.itemId ? "Hide" : "View"}
              </button>
            </div>

            {selectedItem === item.itemId && itemDetails && (
              <div className="mt-2 pt-2 border-t border-[#15112b]/10">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#15112b]">
                  <div className="flex items-center">
                    <span className="opacity-75 mr-1">Mass:</span>
                    <span>{itemDetails.mass}kg</span>
                  </div>
                  <div className="flex items-center">
                    <span className="opacity-75 mr-1">Priority:</span>
                    <span>{itemDetails.priority}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="opacity-75 mr-1">Usage:</span>
                    <span>{itemDetails.usageLimit}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="opacity-75 mr-1">Zone:</span>
                    <span>{itemDetails.preferredZone}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="opacity-75 mr-1">Size:</span>
                    <span>
                      {itemDetails.width}×{itemDetails.depth}×
                      {itemDetails.height}cm
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="opacity-75 mr-1">Expires:</span>
                    <span>
                      {new Date(itemDetails.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-[#ffffff] text-center py-2 text-xs bg-[#1e1a3c] rounded-lg">
            No items found
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDashboard;
