#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <unordered_map>
#include <tuple>
#include <queue>

using namespace std;

struct Position {
    int x, y, z;  
    Position(int _x = 0, int _y = 0, int _z = 0) : x(_x), y(_y), z(_z) {}
};

struct Item {
    string id;
    string name;
    int width, depth, height;
    int priority;
    string expiryDate;
    int usageLimit;
    string preferredZone;
    
    int volume() const { return width * depth * height; }
    
    Item(string _id, string _name, int w, int d, int h, int p, 
         string exp, int usage, string zone) 
        : id(_id), name(_name), width(w), depth(d), height(h), 
          priority(p), expiryDate(exp), usageLimit(usage), preferredZone(zone) {}
};

struct Container {
    string id;
    string zone;
    int width, depth, height;
    
    int volume() const { return width * depth * height; }
    
    Container(string _id, string _zone, int w, int d, int h) 
        : id(_id), zone(_zone), width(w), depth(h), height(h) {}
};

struct FreeSpace {
    int x, y, z; 
    int width, depth, height;
    
    int volume() const { return width * depth * height; }
    
    FreeSpace(int _x, int _y, int _z, int w, int d, int h) 
        : x(_x), y(_y), z(_z), width(w), depth(d), height(h) {}
    
    bool fits(const Item& item) const {
        return (width >= item.width && depth >= item.depth && height >= item.height);
    }
    
    bool isBetterThan(const FreeSpace& other, const Item& item) const {
        if (fits(item) && !other.fits(item)) return true;
        if (!fits(item) && other.fits(item)) return false;
        
        if (fits(item) && other.fits(item)) {
            int thisWaste = volume() - item.volume();
            int otherWaste = other.volume() - item.volume();
            return thisWaste < otherWaste;
        }
        
        return volume() > other.volume();
    }
};

struct Placement {
    string itemId;
    string containerId;
    Position startPos;
    Position endPos;
    
    Placement(string _itemId, string _containerId, Position _start, Position _end) 
        : itemId(_itemId), containerId(_containerId), startPos(_start), endPos(_end) {}
};

struct ContainerState {
    Container container;
    vector<pair<Item, Position>> placedItems;
    vector<FreeSpace> freeSpaces;
    
    ContainerState(const Container& c) : container(c) {
        freeSpaces.push_back(FreeSpace(0, 0, 0, c.width, c.depth, c.height));
    }

    int usedVolume() const {
        int total = 0;
        for (const auto& p : placedItems) {
            total += p.first.volume();
        }
        return total;
    }

    int freeVolume() const {
        return container.volume() - usedVolume();
    }
    
    bool tryPlaceItem(const Item& item, Position& outPosition) {
        sort(freeSpaces.begin(), freeSpaces.end(), 
             [&item](const FreeSpace& a, const FreeSpace& b) {
                 return a.isBetterThan(b, item);
             });
        
        for (auto it = freeSpaces.begin(); it != freeSpaces.end(); ++it) {
            if (it->fits(item)) {
                FreeSpace space = *it;
                
                freeSpaces.erase(it);
                
                Position pos(space.x, space.y, space.z);
                placedItems.push_back({item, pos});
                
                if (space.height > item.height) {
                    freeSpaces.push_back(FreeSpace(
                        space.x, space.y, space.z + item.height,
                        space.width, space.depth, space.height - item.height
                    ));
                }
                
                if (space.width > item.width) {
                    freeSpaces.push_back(FreeSpace(
                        space.x + item.width, space.y, space.z,
                        space.width - item.width, space.depth, item.height
                    ));
                }
                
                if (space.depth > item.depth) {
                    freeSpaces.push_back(FreeSpace(
                        space.x, space.y + item.depth, space.z,
                        item.width, space.depth - item.depth, item.height
                    ));
                }
                
                mergeFreeSpaces();
                
                outPosition = pos;
                return true;
            }
        }
        
        return false;
    }
    
    void mergeFreeSpaces() {
        sort(freeSpaces.begin(), freeSpaces.end(), 
             [](const FreeSpace& a, const FreeSpace& b) {
                 return a.volume() > b.volume();
             });

        for (size_t i = 0; i < freeSpaces.size(); ++i) {
            for (size_t j = i + 1; j < freeSpaces.size(); ) {
                if (isContained(freeSpaces[j], freeSpaces[i])) {
                    freeSpaces.erase(freeSpaces.begin() + j);
                } else {
                    ++j;
                }
            }
        }
    }
    
    bool isContained(const FreeSpace& a, const FreeSpace& b) const {
        return (a.x >= b.x && a.y >= b.y && a.z >= b.z &&
                a.x + a.width <= b.x + b.width &&
                a.y + a.depth <= b.y + b.depth &&
                a.z + a.height <= b.z + b.height);
    }
    
    bool isAccessible(const Position& pos, const Item& item) const {
        if (pos.y == 0) return true;
        for (const auto& p : placedItems) {
            const Item& placedItem = p.first;
            const Position& placedPos = p.second;
            
            if (placedPos.x == pos.x && placedPos.y == pos.y && placedPos.z == pos.z) continue;
            
            if (placedPos.x < pos.x + item.width && placedPos.x + placedItem.width > pos.x &&
                placedPos.z < pos.z + item.height && placedPos.z + placedItem.height > pos.z &&
                placedPos.y < pos.y) {
                return false;
            }
        }
        
        return true;
    }
    
    // Calculate retrieval steps for an item
    int retrievalSteps(const string& itemId) const {
        // Find the item
        for (size_t i = 0; i < placedItems.size(); ++i) {
            if (placedItems[i].first.id == itemId) {
                const Item& item = placedItems[i].first;
                const Position& pos = placedItems[i].second;
                
                // If the item is accessible, no steps needed
                if (isAccessible(pos, item)) return 0;
                
                // Count items that need to be moved
                int steps = 0;
                for (const auto& p : placedItems) {
                    const Item& placedItem = p.first;
                    const Position& placedPos = p.second;
                    
                    // Skip the item itself
                    if (placedItem.id == itemId) continue;
                    
                    // Check if this item blocks the path
                    if (placedPos.x < pos.x + item.width && placedPos.x + placedItem.width > pos.x &&
                        placedPos.z < pos.z + item.height && placedPos.z + placedItem.height > pos.z &&
                        placedPos.y < pos.y) {
                        steps++;
                    }
                }
                
                return steps;
            }
        }
        
        // Item not found
        return -1;
    }
};

// Main packing function
vector<Placement> packItems(const vector<Item>& items, const vector<Container>& containers) {
    vector<Placement> placements;
    
    // Create container states
    unordered_map<string, ContainerState> containerStates;
    for (const Container& container : containers) {
        containerStates.emplace(container.id, ContainerState(container));
    }
    
    vector<Item> sortedItems = items;
    sort(sortedItems.begin(), sortedItems.end(), [](const Item& a, const Item& b) {
        if (a.priority != b.priority) return a.priority > b.priority;
        return a.volume() > b.volume();
    });
    
    for (const Item& item : sortedItems) {
        bool placed = false;
        
        for (auto& [containerId, state] : containerStates) {
            if (state.container.zone == item.preferredZone) {
                Position pos;
                if (state.tryPlaceItem(item, pos)) {
                    placements.push_back(Placement(
                        item.id, containerId, 
                        pos, 
                        Position(pos.x + item.width, pos.y + item.depth, pos.z + item.height)
                    ));
                    placed = true;
                    break;
                }
            }
        }
        
        if (!placed) {
            for (auto& [containerId, state] : containerStates) {
                Position pos;
                if (state.tryPlaceItem(item, pos)) {
                    placements.push_back(Placement(
                        item.id, containerId, 
                        pos, 
                        Position(pos.x + item.width, pos.y + item.depth, pos.z + item.height)
                    ));
                    placed = true;
                    break;
                }
            }
        }
        
        if (!placed) {
            cout << "Warning: Item " << item.id << " could not be placed. Rearrangement needed." << endl;
        }
    }
    
    return placements;
}

int main() {
    vector<Container> containers = {
        Container("contA", "Crew Quarters", 100, 85, 200),
        Container("contB", "Airlock", 50, 85, 200)
    };
    
    vector<Item> items = {
        Item("001", "Food Packet", 10, 10, 20, 80, "2025-05-20", 30, "Crew Quarters"),
        Item("002", "Oxygen Cylinder", 15, 15, 50, 95, "2025-12-31", 100, "Airlock"),
        Item("003", "First Aid Kit", 20, 20, 10, 100, "2025-07-10", 5, "Medical Bay")
    };
    
    vector<Placement> placements = packItems(items, containers);
    
    cout << "Placements:" << endl;
    for (const Placement& p : placements) {
        cout << "Item " << p.itemId << " placed in container " << p.containerId << " at position ("
             << p.startPos.x << ", " << p.startPos.y << ", " << p.startPos.z << ") to ("
             << p.endPos.x << ", " << p.endPos.y << ", " << p.endPos.z << ")" << endl;
    }
    
    return 0;
}
