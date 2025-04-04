#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <chrono>  // For timing

using namespace std;
using namespace std::chrono; //For high_resolution_clock

// Structure definitions (matching your data)
struct Position {
    double width;
    double depth;
    double height;

    Position(){}

    Position(double w, double d, double h){
        width = w;
        depth = d;
        height = h;
    }
};

struct Item {
    string itemId;
    string name;
    double width;
    double depth;
    double height;
    int priority;
    string expiryDate;
    int usageLimit;
    string preferredZone;

    Item(){}

    Item(string _id, string _name, double w, double d, double h, int p, string ed, int ul, string pz){
        itemId = _id;
        name = _name;
        width = w;
        depth = d;
        height = h;
        priority = p;
        expiryDate = ed;
        usageLimit = ul;
        preferredZone = pz;
    }
};

struct Container {
    string containerId;
    string zone;
    double width;
    double depth;
    double height;

    Container(){}

    Container(string _id, string _zone, double w, double d, double h){
        containerId = _id;
        zone = _zone;
        width = w;
        depth = d;
        height = h;
    }
};

struct Placement {
    string containerId;
    string itemId;
    Position startPos;
    Position endPos;

    Placement(){}

    Placement(string _containerId, string _itemId, Position _startPos, Position _endPos){
        containerId = _containerId;
        itemId = _itemId;
        startPos = _startPos;
        endPos = _endPos;
    }
};

// Function to find an item by itemId (efficient map lookup)
Item* findItem(const map<string, Item>& itemMap, const string& itemId) {
    auto it = itemMap.find(itemId);
    if (it != itemMap.end()) {
        return const_cast<Item*>(&it->second); //Remove constness to allow modification (or use a non-const map)
    }
    return nullptr;
}

// Function to find a container by containerId (efficient map lookup)
Container* findContainer(const map<string, Container>& containerMap, const string& containerId) {
    auto it = containerMap.find(containerId);
    if (it != containerMap.end()) {
        return const_cast<Container*>(&it->second); //Remove constness to allow modification (or use a non-const map)
    }
    return nullptr;
}

// Function to check if a placement is valid (fits within the container)
bool isValidPlacement(const Container& container, const Item& item, const Position& startPos, const Position& endPos) {
    if (startPos.width < 0 || startPos.depth < 0 || startPos.height < 0) return false;
    if (endPos.width > container.width || endPos.depth > container.depth || endPos.height > container.height) return false;
    return true;
}

// AABB collision check (Axis-Aligned Bounding Box) - Optimized for speed
bool isCollision(const Placement& existingPlacement, const Item& newItem, const Position& newStart, const Position& newEnd,
                 const map<string, Item>& itemMap) {
    // Find the existing item to get its dimensions
    Item* existingItem = findItem(itemMap, existingPlacement.itemId);
    if (!existingItem) return true; // Item not found, consider it a collision

    // Calculate the coordinates of the existing placement
    double existingStartWidth = existingPlacement.startPos.width;
    double existingStartDepth = existingPlacement.startPos.depth;
    double existingStartHeight = existingPlacement.startPos.height;
    double existingEndWidth = existingStartWidth + existingItem->width;
    double existingEndDepth = existingStartDepth + existingItem->depth;
    double existingEndHeight = existingStartHeight + existingItem->height;

    // Check for overlap (highly optimized)
    return (newStart.width < existingEndWidth && newEnd.width > existingStartWidth &&
            newStart.depth < existingEndDepth && newEnd.depth > existingStartDepth &&
            newStart.height < existingEndHeight && newEnd.height > existingStartHeight);
}

// 3D Bin Packing Algorithm (Simplified First-Fit Decreasing)
//This is a placeholder; a full implementation requires more complex data structures.
bool packItem(Container& container, Item& item, vector<Placement>& existingPlacements, map<string, Item>& itemMap, Position& startPos, Position& endPos) {

    //1. Attempt to place the item at the preferred coordinates FIRST (from /api/place)
    //  If the preferred coordinates are valid and no collision, place it there and return true

    //2. If preferred coordinates are not specified or invalid:

    // Simple first-fit approach (can be improved with more sophisticated algorithms)
    for (double h = 0; h <= container.height - item.height; ++h) {
        for (double d = 0; d <= container.depth - item.depth; ++d) {
            for (double w = 0; w <= container.width - item.width; ++w) {
                Position potentialStart = {w, d, h};
                Position potentialEnd = {w + item.width, d + item.depth, h + item.height};

                // First, check if the placement is valid for the container
                if (!isValidPlacement(container, item, potentialStart, potentialEnd)) continue;

                // Then, check for collisions with existing placements
                bool collision = false;
                for (const auto& placement : existingPlacements) {
                    if (placement.containerId == container.containerId) {
                        if (isCollision(placement, item, potentialStart, potentialEnd, itemMap)) {
                            collision = true;
                            break;
                        }
                    }
                }

                if (!collision) {
                    startPos = potentialStart;
                    endPos = potentialEnd;
                    return true; // Found a suitable placement
                }
            }
        }
    }
    return false; // No suitable placement found
}


vector<Placement> rearrangeItems(vector<Item>& items, vector<Container>& containers, vector<Placement>& existingPlacements) {
    vector<Placement> newPlacements;

    // 1. Sort items by priority (highest priority first)
    sort(items.begin(), items.end(), [](const Item& a, const Item& b) {
        return a.priority > b.priority;
    });

    // 2. Create a map for fast item lookup
    map<string, Item> itemMap;
    for (auto& item : items) {
        itemMap[item.itemId] = item;
    }

     // 3. Create a map for fast container lookup
    map<string, Container> containerMap;
    for (auto& container : containers) {
        containerMap[container.containerId] = container;
    }

    // 4. Clear existing placements (we're starting from scratch)
    existingPlacements.clear();

    // 5.  Attempt to place each item
    for (auto& item : items) {
        bool placed = false;
        for (auto& container : containers) {
            Position startPos, endPos;
            if (packItem(container, item, existingPlacements, itemMap, startPos, endPos)) {
                Placement newPlacement;
                // newPlacement._id = "rearranged_id_" + item.itemId + "_" + container.containerId; // Unique ID
                newPlacement.containerId = container.containerId;
                newPlacement.itemId = item.itemId;
                newPlacement.startPos = startPos;
                newPlacement.endPos = endPos;
                existingPlacements.push_back(newPlacement); // Add to existing placements
                newPlacements.push_back(newPlacement); // Also add to the new placements for return
                placed = true;
                break; // Item placed, move to the next item
            }
        }
        if (!placed) {
            cerr << "Warning: Item " << item.itemId << " could not be placed during rearrangement." << endl;
        }
    }

    return newPlacements;
}

// Function to handle the /api/place route logic
bool placeItem(string itemId, string containerId, vector<Item>& items, vector<Container>& containers, vector<Placement>& placements, Position preferredStart, Position preferredEnd) {
    // 1. Find the item and container (using maps for efficiency)

     // Create maps for efficient lookup
    map<string, Item> itemMap;
    for (auto& item : items) {
        itemMap[item.itemId] = item;
    }

    map<string, Container> containerMap;
    for (auto& container : containers) {
        containerMap[container.containerId] = container;
    }

    Item* item = findItem(itemMap, itemId);
    Container* container = findContainer(containerMap, containerId);

    if (!item || !container) {
        cerr << "Error: Item or container not found." << endl;
        return false;
    }

    // 2. Check if preferred placement is valid
    if (isValidPlacement(*container, *item, preferredStart, preferredEnd)) {
        // Check for collisions at the preferred location
        bool collision = false;
        for (const auto& placement : placements) {
            if (placement.containerId == containerId) {
                if (isCollision(placement, *item, preferredStart, preferredEnd, itemMap)) {
                    collision = true;
                    break;
                }
            }
        }

        if (!collision) {
            // Preferred placement is valid and no collision, place the item here
            Placement newPlacement;
            // newPlacement._id = "unique_id_" + to_string(placements.size() + 1); // Replace with a proper ID generation
            newPlacement.containerId = containerId;
            newPlacement.itemId = itemId;
            newPlacement.startPos = preferredStart;
            newPlacement.endPos = preferredEnd;

            placements.push_back(newPlacement);
            cout << "Item " << itemId << " placed in container " << containerId << " at preferred location successfully." << endl;
            return true;
        } else {
            cout << "Warning: Preferred placement for item " << itemId << " in container " << containerId << " has collision." << endl;
        }
    }

    // 3. If preferred placement is invalid or has collision, find an alternate placement
    Position startPos, endPos;
    if (packItem(*container, *item, placements, itemMap, startPos, endPos)) {
        // 4. Create a new placement
        Placement newPlacement;
        // newPlacement._id = "unique_id_" + to_string(placements.size() + 1); // Replace with a proper ID generation
        newPlacement.containerId = containerId;
        newPlacement.itemId = itemId;
        newPlacement.startPos = startPos;
        newPlacement.endPos = endPos;

        placements.push_back(newPlacement);
        cout << "Item " << itemId << " placed in container " << containerId << " successfully." << endl;
        return true;
    } else {
        cout << "Error: No suitable placement found for item " << itemId << " in container " << containerId << endl;
        return false;
    }
}


#include <iostream>
#include <sstream>
#include "json.hpp"

using json = nlohmann::json;

using namespace std;

int main() {
    // vector<Item> items = {
    //     {"002", "Oxygen Cylinder", 15, 15, 50, 95, "2025-12-31", 50, "Airlock"},
    //     {"003", "First Aid Kit", 20, 20, 10, 100, "2025-07-10", 20, "Medical Bay"},
    //     {"001", "Food Packet", 10, 10, 20, 80, "2025-05-20", 30, "Crew Quarters"}
    // };

    // vector<Container> containers = {
    //     {"contA", "Crew Quarters", 100, 85, 200},
    //     {"contB", "Airlock", 50, 85, 200},
    //     {"contC", "Medical Bay", 80, 70, 150}
    // };

    // vector<Placement> placements = {
    //     {"contA", "001", {0, 0, 0}, {10, 10, 20}, "2025-04-04T13:36:08.631+00:00", "2025-04-04T13:36:08.631+00:00"},
    //     {"contB", "002", {0, 0, 0}, {15, 15, 50}, "2025-04-04T13:36:07.706+00:00", "2025-04-04T13:36:07.706+00:00"},
    //     {"contC", "003", {0, 0, 0}, {20, 20, 10}, "2025-04-04T13:36:08.259+00:00", "2025-04-04T13:36:08.259+00:00"}
    // };

    // // Example usage of the placeItem function with preferred coordinates
    // Position preferredStart = {5, 5, 5};
    // Position preferredEnd = {20, 20, 55}; // Example end coordinates based on item size
    // bool placed = placeItem("002", "contB", items, containers, placements, preferredStart, preferredEnd);

    ostringstream inputBuffer;
    string line;

    while(getline(cin, line)) {
        inputBuffer << line << "\n";
    }

    string inputData = inputBuffer.str();

    json inputJson = json::parse(inputData);

    json itemsData = inputJson["items"];
    json containerData = inputJson["containers"];
    json placementData = inputJson["placements"];
    json priorityItem = inputJson["priorityItem"];

    vector<Item> Items;
    vector<Container> Containers;
    vector<Placement> Placements;

    for (int i = 0; i < itemsData.size(); i++) {
        Item x = Item(
            itemsData[i]["itemId"],
            itemsData[i]["name"],
            itemsData[i]["width"],
            itemsData[i]["depth"],
            itemsData[i]["height"],
            itemsData[i]["priority"],
            itemsData[i]["expiryData"],
            itemsData[i]["usageLimit"],
            itemsData[i]["preferredZone"]
        );
        Items.push_back(x);
    }

    for (int i = 0; i < containerData.size(); i++) {
        Container x = Container(
            containerData[i]["containerId"],
            containerData[i]["name"],
            containerData[i]["width"],
            containerData[i]["depth"],
            containerData[i]["height"]
        );
        Containers.push_back(x);
    }

    for (int i = 0; i < placementData.size(); i++) {
        Position startCoordinates = {
            placementData[i]["startCoordinates"]["width"],
            placementData[i]["startCoordinates"]["depth"],
            placementData[i]["startCoordinates"]["height"]
        };

        Position endCoordinates = {
            placementData[i]["endCoordinates"]["width"],
            placementData[i]["endCoordinates"]["depth"],
            placementData[i]["endCoordinates"]["height"]
        };

        Placement x = Placement(
            placementData[i]["containerId"],
            placementData[i]["itemId"],
            startCoordinates,
            endCoordinates
        );
        Placements.push_back(x);
    }

    // Example usage of the placeItem function with preferred coordinates
    Position preferredStart = {
        priorityItem["startCoordinates"]["x"],
        priorityItem["startCoordinates"]["y"],
        priorityItem["startCoordinates"]["z"]
    };

    Position preferredEnd = {
        priorityItem["endCoordinates"]["x"],
        priorityItem["endCoordinates"]["y"],
        priorityItem["endCoordinates"]["z"]
    };

    bool placed = placeItem(priorityItem["itemId"], priorityItem["containerId"], Items, Containers, Placements, preferredStart, preferredEnd);

    if (placed) {
        cout << "Item placed successfully.\n";
    } else {
        cout << "Item placement failed.\n";
    }

    cout << "\nRearranging Items...\n";
    vector<Placement> newPlacements = rearrangeItems(Items, Containers, Placements);

    cout << "New Placements after rearrangement:\n";
    for (const auto& p : newPlacements) {
        cout << "Item: " << p.itemId << ", Container: " << p.containerId
             << ", Start: (" << p.startPos.width << ", " << p.startPos.depth << ", " << p.startPos.height << ")"
             << ", End: (" << p.endPos.width << ", " << p.endPos.depth << ", " << p.endPos.height << ")\n";
    }
    return 0;
}
