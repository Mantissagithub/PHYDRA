#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <unordered_map>
#include <unordered_set>
#include <set>
#include <limits>
#include <chrono>

using namespace std;
using namespace std::chrono;

// Structure definitions with optimized constructors
struct Position {
    double width;
    double depth;
    double height;

    Position() : width(0), depth(0), height(0) {}

    Position(double w, double d, double h) : width(w), depth(d), height(h) {}
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
    // Pre-computed volume for faster sorting and comparison
    double volume;

    Item() : width(0), depth(0), height(0), priority(0), usageLimit(0), volume(0) {}

    Item(string _id, string _name, double w, double d, double h, int p, string ed, int ul, string pz)
        : itemId(_id), name(_name), width(w), depth(d), height(h), 
          priority(p), expiryDate(ed), usageLimit(ul), preferredZone(pz) {
        volume = w * d * h; // Pre-compute volume
    }
};

struct Container {
    string containerId;
    string zone;
    double width;
    double depth;
    double height;
    double totalVolume; // Pre-compute total volume

    Container() : width(0), depth(0), height(0), totalVolume(0) {}

    Container(string _id, string _zone, double w, double d, double h)
        : containerId(_id), zone(_zone), width(w), depth(d), height(h) {
        totalVolume = w * d * h; // Pre-compute total volume
    }
};

struct Placement {
    string containerId;
    string itemId;
    Position startPos;
    Position endPos;

    Placement() {}

    Placement(string _containerId, string _itemId, Position _startPos, Position _endPos)
        : containerId(_containerId), itemId(_itemId), startPos(_startPos), endPos(_endPos) {}
};

// Function to find an item by itemId - O(1) complexity
Item* findItem(const map<string, Item>& itemMap, const string& itemId) {
    auto it = itemMap.find(itemId);
    if (it != itemMap.end()) {
        return const_cast<Item*>(&it->second);
    }
    return nullptr;
}

// Function to find a container by containerId - O(1) complexity
Container* findContainer(const map<string, Container>& containerMap, const string& containerId) {
    auto it = containerMap.find(containerId);
    if (it != containerMap.end()) {
        return const_cast<Container*>(&it->second);
    }
    return nullptr;
}

// Function to check if a placement is valid - optimized with early returns
bool isValidPlacement(const Container& container, const Item& item, const Position& startPos, const Position& endPos) {
    // Early exit checks
    if (startPos.width < 0 || startPos.depth < 0 || startPos.height < 0) return false;
    if (endPos.width > container.width || endPos.depth > container.depth || endPos.height > container.height) return false;
    return true;
}

// Optimized AABB collision detection with early exits
bool isCollision(const Placement& existingPlacement, const Item& newItem, 
                 const Position& newStart, const Position& newEnd,
                 const map<string, Item>& itemMap) {
    // Find the existing item to get its dimensions
    auto it = itemMap.find(existingPlacement.itemId);
    if (it == itemMap.end()) return true; // Item not found, consider it a collision
    
    const Item& existingItem = it->second;
    
    // Early exit tests - using separating axis theorem principle
    if (newEnd.width <= existingPlacement.startPos.width || 
        newStart.width >= existingPlacement.endPos.width ||
        newEnd.depth <= existingPlacement.startPos.depth || 
        newStart.depth >= existingPlacement.endPos.depth ||
        newEnd.height <= existingPlacement.startPos.height || 
        newStart.height >= existingPlacement.endPos.height) {
        return false; // No collision
    }
    
    // If we reach here, boxes overlap in all three dimensions
    return true;
}

// Skyline Best-Fit 3D Bin Packing Algorithm - Optimized
bool packItem(Container& container, Item& item, vector<Placement>& existingPlacements, 
              map<string, Item>& itemMap, Position& startPos, Position& endPos) {
    // First try preferred coordinates if they exist
    if (startPos.width >= 0 && startPos.depth >= 0 && startPos.height >= 0) {
        Position potentialEnd = {
            startPos.width + item.width, 
            startPos.depth + item.depth, 
            startPos.height + item.height
        };

        if (isValidPlacement(container, item, startPos, potentialEnd)) {
            // Check for collisions with existing placements in this container only
            bool collision = false;
            for (const auto& placement : existingPlacements) {
                if (placement.containerId == container.containerId) {
                    if (isCollision(placement, item, startPos, potentialEnd, itemMap)) {
                        collision = true;
                        break;
                    }
                }
            }
            
            if (!collision) {
                endPos = potentialEnd;
                return true; // Preferred placement worked
            }
        }
    }

    // Initialize best position with high waste value
    double bestWaste = numeric_limits<double>::max();
    Position bestPos = {-1, -1, -1};

    // Extract existing items in this container for height map calculation
    vector<const Placement*> containerPlacements;
    containerPlacements.reserve(existingPlacements.size()); // Pre-allocate space
    for (const auto& p : existingPlacements) {
        if (p.containerId == container.containerId) {
            containerPlacements.push_back(&p);
        }
    }

    // Create a sparse height map using unordered_map for better performance
    using CoordKey = pair<int, int>;
    struct CoordHash {
        size_t operator()(const CoordKey& k) const {
            return hash<int>()(k.first) ^ (hash<int>()(k.second) << 1);
        }
    };
    unordered_map<CoordKey, double, CoordHash> heightMap;
    heightMap.reserve(container.width * container.depth); // Pre-allocate space

    // Populate height map
    for (const auto* p : containerPlacements) {
        auto itemIt = itemMap.find(p->itemId);
        if (itemIt == itemMap.end()) continue;

        for (int x = p->startPos.width; x < p->endPos.width; ++x) {
            for (int y = p->startPos.depth; y < p->endPos.depth; ++y) {
                heightMap[{x, y}] = max(heightMap[{x, y}], p->endPos.height);
            }
        }
    }

    // Try positions with best-fit approach - optimize step size for larger items
    int xStep = max(1, static_cast<int>(item.width / 10));
    int yStep = max(1, static_cast<int>(item.depth / 10));

    for (int y = 0; y <= container.depth - item.depth; y += yStep) {
        for (int x = 0; x <= container.width - item.width; x += xStep) {
            // Find maximum height at this (x,y) position
            double maxHeight = 0;
            for (int dx = 0; dx < item.width; ++dx) {
                for (int dy = 0; dy < item.depth; ++dy) {
                    maxHeight = max(maxHeight, heightMap[{x + dx, y + dy}]);
                }
            }
            
            // Try placing item at this position with this height
            Position tryPos = {static_cast<double>(x), static_cast<double>(y), maxHeight};
            Position tryEnd = {
                tryPos.width + item.width, 
                tryPos.depth + item.depth, 
                tryPos.height + item.height
            };
            
            if (!isValidPlacement(container, item, tryPos, tryEnd)) continue;
            
            // Check for collisions
            bool collision = false;
            for (const auto* p : containerPlacements) {
                if (isCollision(*p, item, tryPos, tryEnd, itemMap)) {
                    collision = true;
                    break;
                }
            }
            
            if (collision) continue;
            
            // Calculate waste (empty space under the item)
            double waste = 0;
            for (int dx = 0; dx < item.width; ++dx) {
                for (int dy = 0; dy < item.depth; ++dy) {
                    waste += (maxHeight - heightMap[{x + dx, y + dy}]);
                }
            }
            
            // If this is the best position so far, save it
            if (waste < bestWaste) {
                bestWaste = waste;
                bestPos = tryPos;
                
                // If we found a perfect fit (no waste), use it immediately
                if (waste < 0.001) break;
            }
        }
        if (bestWaste < 0.001) break; // Found perfect fit, exit early
    }

    // If we found a valid position, return it
    if (bestPos.width >= 0) {
        startPos = bestPos;
        endPos = {
            startPos.width + item.width, 
            startPos.depth + item.depth, 
            startPos.height + item.height
        };
        return true;
    }

    return false; // No suitable placement found
}

vector<Placement> rearrangeItems(vector<Item>& items, vector<Container>& containers, 
                                vector<Placement>& existingPlacements) {
    vector<Placement> newPlacements;
    newPlacements.reserve(items.size()); // Pre-allocate memory
    
    // Create maps for fast lookups
    map<string, Item> itemMap;
    for (auto& item : items) {
        itemMap[item.itemId] = item;
    }
    
    map<string, Container> containerMap;
    for (auto& container : containers) {
        containerMap[container.containerId] = container;
    }
    
    // Create a copy of original items for sorting
    vector<Item> sortedItems = items;
    
    // Sort by multiple criteria:
    // 1. Priority (highest first)
    // 2. Volume (largest first)
    // 3. Expiry date (soonest first)
    sort(sortedItems.begin(), sortedItems.end(), [](const Item& a, const Item& b) {
        if (a.priority != b.priority)
            return a.priority > b.priority;
        
        // Use pre-computed volume
        if (abs(a.volume - b.volume) > 0.01)
            return a.volume > b.volume;
            
        return a.expiryDate < b.expiryDate;
    });
    
    // Keep track of placed items to avoid duplicates
    unordered_set<string> placedItems;
    placedItems.reserve(items.size()); // Pre-allocate
    
    // Map to track container utilization
    unordered_map<string, double> containerUtilization;
    containerUtilization.reserve(containers.size()); // Pre-allocate
    for (auto& container : containers) {
        containerUtilization[container.containerId] = 0.0;
    }
    
    // Clear existing placements but remember the original placement configuration
    vector<Placement> originalPlacements = existingPlacements;
    cout << "Original placements count: " << originalPlacements.size() << endl;
    
    // Clear existing placements before rearrangement
    existingPlacements.clear();
    
    // Process each item
    for (auto& item : sortedItems) {
        // Skip if already placed
        if (placedItems.find(item.itemId) != placedItems.end()) {
            cout << "Item " << item.itemId << " already placed, skipping..." << endl;
            continue;
        }
        
        bool placed = false;
        
        cout << "Processing item: " << item.itemId << " (Priority: " << item.priority << ", Volume: " << item.volume << ")" << endl;
        
        // First try placing in preferred zone containers
        vector<pair<string, double>> preferredContainers;
        preferredContainers.reserve(containers.size()); // Pre-allocate space
        
        for (auto& container : containers) {
            if (container.zone == item.preferredZone) {
                // Calculate available volume percentage
                double utilization = containerUtilization[container.containerId] / container.totalVolume;
                preferredContainers.push_back({container.containerId, utilization});
            }
        }
        
        // Sort preferred containers by utilization (least utilized first)
        sort(preferredContainers.begin(), preferredContainers.end(),
             [](const pair<string, double>& a, const pair<string, double>& b) {
                 return a.second < b.second;
             });
        
        cout << "Found " << preferredContainers.size() << " preferred containers for zone: " << item.preferredZone << endl;
        
        // Try preferred containers first
        for (auto& [containerId, utilPct] : preferredContainers) {
            Container& container = containerMap[containerId];
            Position startPos, endPos;
            
            cout << "Trying container " << containerId << " (current utilization: " << utilPct * 100 << "%)" << endl;
            
            if (packItem(container, item, existingPlacements, itemMap, startPos, endPos)) {
                Placement newPlacement{
                    containerId,
                    item.itemId,
                    startPos,
                    endPos
                };
                
                existingPlacements.push_back(newPlacement);
                newPlacements.push_back(newPlacement);
                
                // Update container utilization
                containerUtilization[containerId] += item.volume;
                
                placedItems.insert(item.itemId);
                placed = true;
                
                cout << "Item " << item.itemId << " placed in preferred container " << containerId 
                     << " at position (" << startPos.width << ", " << startPos.depth << ", " << startPos.height << ")" << endl;
                break;
            }
        }
        
        // If not placed in preferred zone, try any container
        if (!placed) {
            cout << "Could not place item " << item.itemId << " in preferred zone. Trying any container..." << endl;
            
            // Sort all containers by utilization (least utilized first)
            vector<pair<string, double>> allContainers;
            allContainers.reserve(containers.size()); // Pre-allocate space
            
            for (auto& container : containers) {
                double utilization = containerUtilization[container.containerId] / container.totalVolume;
                allContainers.push_back({container.containerId, utilization});
            }
            
            sort(allContainers.begin(), allContainers.end(),
                 [](const pair<string, double>& a, const pair<string, double>& b) {
                     return a.second < b.second;
                 });
            
            // Create a set of preferred container IDs for faster lookup
            unordered_set<string> preferredContainerIds;
            for (auto& [containerId, _] : preferredContainers) {
                preferredContainerIds.insert(containerId);
            }
            
            for (auto& [containerId, utilPct] : allContainers) {
                // Skip if we already tried this in preferred containers
                if (preferredContainerIds.find(containerId) != preferredContainerIds.end()) {
                    continue;
                }
                
                Container& container = containerMap[containerId];
                Position startPos, endPos;
                
                cout << "Trying container " << containerId << " (current utilization: " << utilPct * 100 << "%)" << endl;
                
                if (packItem(container, item, existingPlacements, itemMap, startPos, endPos)) {
                    Placement newPlacement{
                        containerId,
                        item.itemId,
                        startPos,
                        endPos
                    };
                    
                    existingPlacements.push_back(newPlacement);
                    newPlacements.push_back(newPlacement);
                    
                    // Update container utilization
                    containerUtilization[containerId] += item.volume;
                    
                    placedItems.insert(item.itemId);
                    placed = true;
                    
                    cout << "Item " << item.itemId << " placed in container " << containerId 
                         << " at position (" << startPos.width << ", " << startPos.depth << ", " << startPos.height << ")" << endl;
                    break;
                }
            }
        }
        
        if (!placed) {
            cerr << "Warning: Item " << item.itemId << " could not be placed during rearrangement." << endl;
        }
    }
    
    // Compare new placements with original
    cout << "\nPlacement comparison:" << endl;
    cout << "Original placements: " << originalPlacements.size() << endl;
    cout << "New placements: " << newPlacements.size() << endl;
    
    // Check for changes in item positions
    for (const auto& oldP : originalPlacements) {
        bool found = false;
        for (const auto& newP : newPlacements) {
            if (oldP.itemId == newP.itemId) {
                found = true;
                if (oldP.containerId != newP.containerId ||
                    oldP.startPos.width != newP.startPos.width ||
                    oldP.startPos.depth != newP.startPos.depth ||
                    oldP.startPos.height != newP.startPos.height) {
                    
                    cout << "Item " << oldP.itemId << " moved from " 
                         << oldP.containerId << " (" << oldP.startPos.width << ", " << oldP.startPos.depth << ", " << oldP.startPos.height << ")"
                         << " to " 
                         << newP.containerId << " (" << newP.startPos.width << ", " << newP.startPos.depth << ", " << newP.startPos.height << ")" << endl;
                } else {
                    cout << "Item " << oldP.itemId << " position unchanged" << endl;
                }
                break;
            }
        }
        
        if (!found) {
            cout << "Item " << oldP.itemId << " was removed from placement" << endl;
        }
    }
    
    return newPlacements;
}

#include <iostream>
#include <sstream>
#include "json.hpp"

using json = nlohmann::json;

using namespace std;

int main() {
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
        string itemId = itemsData[i].contains("itemId") && !itemsData[i]["itemId"].is_null() ? itemsData[i]["itemId"].get<string>() : "";
        string name = itemsData[i].contains("name") && !itemsData[i]["name"].is_null() ? itemsData[i]["name"].get<string>() : "";
        double width = itemsData[i].contains("width") && !itemsData[i]["width"].is_null() ? itemsData[i]["width"].get<double>() : 0.0;
        double depth = itemsData[i].contains("depth") && !itemsData[i]["depth"].is_null() ? itemsData[i]["depth"].get<double>() : 0.0;
        double height = itemsData[i].contains("height") && !itemsData[i]["height"].is_null() ? itemsData[i]["height"].get<double>() : 0.0;
        int priority = itemsData[i].contains("priority") && !itemsData[i]["priority"].is_null() ? itemsData[i]["priority"].get<int>() : 0;
        string expiryDate = itemsData[i].contains("expiryData") && !itemsData[i]["expiryData"].is_null() ? itemsData[i]["expiryData"].get<string>() : "";
        int usageLimit = itemsData[i].contains("usageLimit") && !itemsData[i]["usageLimit"].is_null() ? itemsData[i]["usageLimit"].get<int>() : 0;
        string preferredZone = itemsData[i].contains("preferredZone") && !itemsData[i]["preferredZone"].is_null() ? itemsData[i]["preferredZone"].get<string>() : "";

        Item x = Item(itemId, name, width, depth, height, priority, expiryDate, usageLimit, preferredZone);
        Items.push_back(x);
    }

    for (int i = 0; i < containerData.size(); i++) {
        string containerId = containerData[i].contains("containerId") && !containerData[i]["containerId"].is_null() ? containerData[i]["containerId"].get<string>() : "";
        string zone = containerData[i].contains("name") && !containerData[i]["name"].is_null() ? containerData[i]["name"].get<string>() : "";
        double width = containerData[i].contains("width") && !containerData[i]["width"].is_null() ? containerData[i]["width"].get<double>() : 0.0;
        double depth = containerData[i].contains("depth") && !containerData[i]["depth"].is_null() ? containerData[i]["depth"].get<double>() : 0.0;
        double height = containerData[i].contains("height") && !containerData[i]["height"].is_null() ? containerData[i]["height"].get<double>() : 0.0;

        Container x = Container(containerId, zone, width, depth, height);
        Containers.push_back(x);
    }

    for (int i = 0; i < placementData.size(); i++) {
        Position startCoordinates = {
            placementData[i]["startCoordinates"].contains("width") && !placementData[i]["startCoordinates"]["width"].is_null() ? placementData[i]["startCoordinates"]["width"].get<double>() : 0.0,
            placementData[i]["startCoordinates"].contains("depth") && !placementData[i]["startCoordinates"]["depth"].is_null() ? placementData[i]["startCoordinates"]["depth"].get<double>() : 0.0,
            placementData[i]["startCoordinates"].contains("height") && !placementData[i]["startCoordinates"]["height"].is_null() ? placementData[i]["startCoordinates"]["height"].get<double>() : 0.0
        };

        Position endCoordinates = {
            placementData[i]["endCoordinates"].contains("width") && !placementData[i]["endCoordinates"]["width"].is_null() ? placementData[i]["endCoordinates"]["width"].get<double>() : 0.0,
            placementData[i]["endCoordinates"].contains("depth") && !placementData[i]["endCoordinates"]["depth"].is_null() ? placementData[i]["endCoordinates"]["depth"].get<double>() : 0.0,
            placementData[i]["endCoordinates"].contains("height") && !placementData[i]["endCoordinates"]["height"].is_null() ? placementData[i]["endCoordinates"]["height"].get<double>() : 0.0
        };

        Placement x = Placement(
            placementData[i].contains("containerId") && !placementData[i]["containerId"].is_null() ? placementData[i]["containerId"].get<string>() : "",
            placementData[i].contains("itemId") && !placementData[i]["itemId"].is_null() ? placementData[i]["itemId"].get<string>() : "",
            startCoordinates,
            endCoordinates
        );
        Placements.push_back(x);
    }

    // Example usage of the placeItem function with preferred coordinates
    Position preferredStart = {
        priorityItem["startCoordinates"].contains("x") && !priorityItem["startCoordinates"]["x"].is_null() ? priorityItem["startCoordinates"]["x"].get<double>() : 0.0,
        priorityItem["startCoordinates"].contains("y") && !priorityItem["startCoordinates"]["y"].is_null() ? priorityItem["startCoordinates"]["y"].get<double>() : 0.0,
        priorityItem["startCoordinates"].contains("z") && !priorityItem["startCoordinates"]["z"].is_null() ? priorityItem["startCoordinates"]["z"].get<double>() : 0.0
    };

    Position preferredEnd = {
        priorityItem["endCoordinates"].contains("x") && !priorityItem["endCoordinates"]["x"].is_null() ? priorityItem["endCoordinates"]["x"].get<double>() : 0.0,
        priorityItem["endCoordinates"].contains("y") && !priorityItem["endCoordinates"]["y"].is_null() ? priorityItem["endCoordinates"]["y"].get<double>() : 0.0,
        priorityItem["endCoordinates"].contains("z") && !priorityItem["endCoordinates"]["z"].is_null() ? priorityItem["endCoordinates"]["z"].get<double>() : 0.0
    };

    map<string, Item> itemMap;
    for (auto& item : Items) {
        itemMap[item.itemId] = item;
    }
    
    map<string, Container> containerMap;
    for (auto& container : Containers) {
        containerMap[container.containerId] = container;
    }

    string itemId = priorityItem["itemId"].get<string>();
    string containerId = priorityItem["containerId"].get<string>();

    bool placed = false;
    if (itemMap.find(itemId) != itemMap.end() && containerMap.find(containerId) != containerMap.end()) {
        Position endPos;
        placed = packItem(containerMap[containerId], itemMap[itemId], Placements, itemMap, preferredStart, endPos);
        
        if (placed) {
            Placement newPlacement(containerId, itemId, preferredStart, endPos);
            Placements.push_back(newPlacement);
        }
    }

    if (placed) {
        cout << "Item placed successfully.\n";
    } else {
        cout << "Item placement failed.\n";
    }

    cout << "\nRearranging Items...\n";
    vector<Placement> newPlacements = rearrangeItems(Items, Containers, Placements);
    
    cout << "\nFinal Placements after rearrangement:\n";
    for (const auto& p : newPlacements) {
        cout << "Item: " << p.itemId << ", Container: " << p.containerId 
             << ", Start: (" << p.startPos.width << ", " << p.startPos.depth << ", " << p.startPos.height << ")"
             << ", End: (" << p.endPos.width << ", " << p.endPos.depth << ", " << p.endPos.height << ")\n";
    }
    
    // Display position changes summary
    cout << "\nPlacement Changes Summary:" << endl;
    json result = json::array();
    for (const auto& p : newPlacements) {
        json placement;
        placement["itemId"] = p.itemId;
        placement["containerId"] = p.containerId;
        placement["startCoordinates"] = {
            {"width", p.startPos.width},
            {"depth", p.startPos.depth},
            {"height", p.startPos.height}
        };
        placement["endCoordinates"] = {
            {"width", p.endPos.width},
            {"depth", p.endPos.depth},
            {"height", p.endPos.height}
        };
        result.push_back(placement);
    }
    
    cout << result.dump(4) << endl;
    return 0;
}