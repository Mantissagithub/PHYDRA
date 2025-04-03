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
    int priorityScore;
    
    int volume() const { return width * depth * height; }

    Item(){}
    
    Item(string _id, string _name, int w, int d, int h, int p, 
         string exp, int usage, string zone, int score) 
        : id(_id), name(_name), width(w), depth(d), height(h), 
          priority(p), expiryDate(exp), usageLimit(usage), preferredZone(zone), priorityScore(score) {}
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
        cout << "Comparing FreeSpace at (" << x << ", " << y << ", " << z << ") with dimensions (" 
             << width << "x" << depth << "x" << height << ") to FreeSpace at (" 
             << other.x << ", " << other.y << ", " << other.z << ") with dimensions (" 
             << other.width << "x" << other.depth << "x" << other.height << ") for item with dimensions (" 
             << item.width << "x" << item.depth << "x" << item.height << ")" << endl;

        if (fits(item) && !other.fits(item)) {
            cout << "This FreeSpace fits the item, but the other does not." << endl;
            return true;
        }
        if (!fits(item) && other.fits(item)) {
            cout << "The other FreeSpace fits the item, but this one does not." << endl;
            return false;
        }
        
        if (fits(item) && other.fits(item)) {
            int thisWaste = volume() - item.volume();
            int otherWaste = other.volume() - item.volume();
            cout << "Both FreeSpaces fit the item. This FreeSpace waste: " << thisWaste 
                 << ", Other FreeSpace waste: " << otherWaste << endl;
            return thisWaste < otherWaste;
        }
        
        cout << "Neither FreeSpace fits the item. Comparing volumes. This FreeSpace volume: " 
             << volume() << ", Other FreeSpace volume: " << other.volume() << endl;
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

struct Rearrangement{
    int step;
    string action;
    string itemId;
    string fromContainer;
    Position fromStartCoordinates;
    Position fromEndCoordinates;
    string toContainer;
    Position toStartCoordinates;
    Position toEndCoordinates;

    Rearrangement(){}

    Rearrangement(int _step, string _action, string _itemId, string _fromContainer, 
                  Position _fromStartCoordinates, Position _fromEndCoordinates, 
                  string _toContainer, Position _toStartCoordinates, Position _toEndCoordinates) 
        : step(_step), action(_action), itemId(_itemId), fromContainer(_fromContainer), 
          fromStartCoordinates(_fromStartCoordinates), fromEndCoordinates(_fromEndCoordinates), 
          toContainer(_toContainer), toStartCoordinates(_toStartCoordinates), toEndCoordinates(_toEndCoordinates) {}
};

vector<Rearrangement> rearrangements;
int rearrangementStep = 0;

struct ContainerState {
    Container container;
    vector<pair<Item, Position>> placedItems;
    vector<FreeSpace> freeSpaces;
    // vector<Rearrangement> rearrangements;
    // int rearrangementStep = 0;
    
    //For removal, check all containers
    unordered_map<string, ContainerState>& allContainerStates;

    ContainerState(const Container& c) : container(c), allContainerStates(*(new unordered_map<string, ContainerState>)) {
        freeSpaces.push_back(FreeSpace(0, 0, 0, c.width, c.depth, c.height));
    }
    
    ContainerState(const Container& c, unordered_map<string, ContainerState>& _allContainerStates)
        : container(c), allContainerStates(_allContainerStates) {
        freeSpaces.push_back(FreeSpace(0, 0, 0, c.width, c.depth, c.height));
    }

    int usedVolume() const {
        int total = 0;
        for (const auto& p : placedItems) {
            total += p.first.volume();
        }
        cout << "Used volume in container " << container.id << ": " << total << endl;
        return total;
    }

    int freeVolume() const {
        int freeVol = container.volume() - usedVolume();
        cout << "Free volume in container " << container.id << ": " << freeVol << endl;
        return freeVol;
    }
    
    bool tryPlaceItem(const Item& item, Position& outPosition) {
        cout << "Attempting to place item " << item.id << " with dimensions (" 
             << item.width << "x" << item.depth << "x" << item.height << ") in container " 
             << container.id << endl;

        sort(freeSpaces.begin(), freeSpaces.end(), 
             [&item](const FreeSpace& a, const FreeSpace& b) {
                 return a.isBetterThan(b, item);
             });
        
        for (auto it = freeSpaces.begin(); it != freeSpaces.end(); ++it) {
            if (it->fits(item)) {
                FreeSpace space = *it;
                cout << "Found suitable FreeSpace at (" << space.x << ", " << space.y << ", " 
                     << space.z << ") with dimensions (" << space.width << "x" << space.depth 
                     << "x" << space.height << ")" << endl;

                freeSpaces.erase(it);
                
                Position pos(space.x, space.y, space.z);
                placedItems.push_back({item, pos});
                cout << "Placed item " << item.id << " at position (" << pos.x << ", " << pos.y 
                     << ", " << pos.z << ")" << endl;
                
                if (space.height > item.height) {
                    freeSpaces.push_back(FreeSpace(
                        space.x, space.y, space.z + item.height,
                        space.width, space.depth, space.height - item.height
                    ));
                    cout << "Created new FreeSpace above the placed item." << endl;
                }
                
                if (space.width > item.width) {
                    freeSpaces.push_back(FreeSpace(
                        space.x + item.width, space.y, space.z,
                        space.width - item.width, space.depth, item.height
                    ));
                    cout << "Created new FreeSpace to the right of the placed item." << endl;
                }
                
                if (space.depth > item.depth) {
                    freeSpaces.push_back(FreeSpace(
                        space.x, space.y + item.depth, space.z,
                        item.width, space.depth - item.depth, item.height
                    ));
                    cout << "Created new FreeSpace in front of the placed item." << endl;
                }
                
                mergeFreeSpaces();
                
                outPosition = pos;
                return true;
            }
        }

        for (auto& [blockingItem, blockingPos] : placedItems) {
            cout<<"Entering the rearrangement thing..."<<endl;
            if (blockingPos.y + blockingItem.height > item.height + outPosition.y) {
                Position shiftPos = blockingPos;
                shiftPos.y = item.height + outPosition.y;  

                if (shiftPos.y + blockingItem.height <= container.height) {
                    rearrangements.push_back(Rearrangement(
                        ++rearrangementStep, "shift", blockingItem.id, container.id,
                        blockingPos, Position(blockingPos.x + blockingItem.width, blockingPos.y + blockingItem.depth, blockingPos.z + blockingItem.height),
                        container.id, shiftPos, Position(shiftPos.x + blockingItem.width, shiftPos.y + blockingItem.depth, shiftPos.z + blockingItem.height)
                    ));
                    blockingPos.y = shiftPos.y; 

                } else {
                    bool foundSpace = false;
                    for (auto& [otherContainerId, otherContainerState] : allContainerStates) {
                        if (otherContainerId == container.id) continue;
                         Position otherPos;
                         if (otherContainerState.tryPlaceItem(blockingItem, otherPos)) {
                           rearrangements.push_back(Rearrangement(
                               ++rearrangementStep, "move", blockingItem.id, container.id,
                               blockingPos, Position(blockingPos.x + blockingItem.width, blockingPos.y + blockingItem.depth, blockingPos.z + blockingItem.height),
                               otherContainerId, otherPos, Position(otherPos.x + blockingItem.width, otherPos.y + blockingItem.depth, otherPos.z + blockingItem.height)
                           ));

                             placedItems.erase(remove_if(placedItems.begin(), placedItems.end(),
                                        [&](const pair<Item, Position>& p) {
                                            return p.first.id == blockingItem.id;
                                        }),
                              placedItems.end());

                              foundSpace = true;
                              break;
                         }
                     }
                     if(!foundSpace) {
                       rearrangements.push_back(Rearrangement(
                           ++rearrangementStep, "remove", blockingItem.id, container.id,
                           blockingPos, Position(blockingPos.x + blockingItem.width, blockingPos.y + blockingItem.depth, blockingPos.z + blockingItem.height),
                           "", Position(), Position()
                       ));

                        placedItems.erase(remove_if(placedItems.begin(), placedItems.end(),
                                        [&](const pair<Item, Position>& p) {
                                            return p.first.id == blockingItem.id;
                                        }),
                              placedItems.end());

                     }

                }
                   if (tryPlaceItem(item, outPosition)) {
                       return true;
                   }

                   } else if(blockingPos.y < item.height){   

                         bool foundSpace = false;
                         for (auto& [otherContainerId, otherContainerState] : allContainerStates) {
                             if (otherContainerId == container.id) continue;
                             Position otherPos;
                             if (otherContainerState.tryPlaceItem(blockingItem, otherPos)) {
                                rearrangements.push_back(Rearrangement(
                                    ++rearrangementStep, "move", blockingItem.id, container.id,
                                    blockingPos, Position(blockingPos.x + blockingItem.width, blockingPos.y + blockingItem.depth, blockingPos.z + blockingItem.height),
                                    otherContainerId, otherPos, Position(otherPos.x + blockingItem.width, otherPos.y + blockingItem.depth, otherPos.z + blockingItem.height)
                                ));
                                 placedItems.erase(remove_if(placedItems.begin(), placedItems.end(),
                                        [&](const pair<Item, Position>& p) {
                                            return p.first.id == blockingItem.id;
                                        }),
                              placedItems.end());
                                 foundSpace = true;
                                 break;

                             }
                         }
                          if(!foundSpace) {
                       rearrangements.push_back(Rearrangement(
                           ++rearrangementStep, "remove", blockingItem.id, container.id,
                           blockingPos, Position(blockingPos.x + blockingItem.width, blockingPos.y + blockingItem.depth, blockingPos.z + blockingItem.height),
                           "", Position(), Position()
                       ));

                        placedItems.erase(remove_if(placedItems.begin(), placedItems.end(),
                                        [&](const pair<Item, Position>& p) {
                                            return p.first.id == blockingItem.id;
                                        }),
                              placedItems.end());

                     }

                    if (tryPlaceItem(item, outPosition)) {
                      return true;
                   }
               }
           }
        
        cout << "Failed to place item " << item.id << " in container " << container.id << endl;
        return false;
    }
    
    void mergeFreeSpaces() {
        cout << "Merging FreeSpaces in container " << container.id << endl;
        sort(freeSpaces.begin(), freeSpaces.end(), 
             [](const FreeSpace& a, const FreeSpace& b) {
                 return a.volume() > b.volume();
             });

        for (size_t i = 0; i < freeSpaces.size(); ++i) {
            for (size_t j = i + 1; j < freeSpaces.size(); ) {
                if (isContained(freeSpaces[j], freeSpaces[i])) {
                    cout << "FreeSpace at (" << freeSpaces[j].x << ", " << freeSpaces[j].y 
                         << ", " << freeSpaces[j].z << ") is contained within FreeSpace at (" 
                         << freeSpaces[i].x << ", " << freeSpaces[i].y << ", " 
                         << freeSpaces[i].z << "). Removing it." << endl;
                    freeSpaces.erase(freeSpaces.begin() + j);
                } else {
                    ++j;
                }
            }
        }
    }
    
    bool isContained(const FreeSpace& a, const FreeSpace& b) const {
        bool contained = (a.x >= b.x && a.y >= b.y && a.z >= b.z &&
                          a.x + a.width <= b.x + b.width &&
                          a.y + a.depth <= b.y + b.depth &&
                          a.z + a.height <= b.z + b.height);
        if (contained) {
            cout << "FreeSpace at (" << a.x << ", " << a.y << ", " << a.z 
                 << ") is contained within FreeSpace at (" << b.x << ", " << b.y 
                 << ", " << b.z << ")" << endl;
        }
        return contained;
    }
    
    bool isAccessible(const Position& pos, const Item& item) const {
        if (pos.y == 0) {
            cout << "Item at position (" << pos.x << ", " << pos.y << ", " << pos.z 
                 << ") is accessible because it is on the ground." << endl;
            return true;
        }
        for (const auto& p : placedItems) {
            const Item& placedItem = p.first;
            const Position& placedPos = p.second;
            
            if (placedPos.x == pos.x && placedPos.y == pos.y && placedPos.z == pos.z) continue;
            
            if (placedPos.x < pos.x + item.width && placedPos.x + placedItem.width > pos.x &&
                placedPos.z < pos.z + item.height && placedPos.z + placedItem.height > pos.z &&
                placedPos.y < pos.y) {
                cout << "Item at position (" << pos.x << ", " << pos.y << ", " << pos.z 
                     << ") is not accessible due to blocking item at position (" 
                     << placedPos.x << ", " << placedPos.y << ", " << placedPos.z << ")" << endl;
                return false;
            }
        }
        
        cout << "Item at position (" << pos.x << ", " << pos.y << ", " << pos.z 
             << ") is accessible." << endl;
        return true;
    }
    
    int retrievalSteps(const string& itemId) const {
        cout << "Calculating retrieval steps for item " << itemId << " in container " 
             << container.id << endl;

        for (size_t i = 0; i < placedItems.size(); ++i) {
            if (placedItems[i].first.id == itemId) {
                const Item& item = placedItems[i].first;
                const Position& pos = placedItems[i].second;
                
                if (isAccessible(pos, item)) {
                    cout << "Item " << itemId << " is accessible. No retrieval steps needed." << endl;
                    return 0;
                }
                
                int steps = 0;
                for (const auto& p : placedItems) {
                    const Item& placedItem = p.first;
                    const Position& placedPos = p.second;
                    
                    if (placedItem.id == itemId) continue;
                    
                    if (placedPos.x < pos.x + item.width && placedPos.x + placedItem.width > pos.x &&
                        placedPos.z < pos.z + item.height && placedPos.z + placedItem.height > pos.z &&
                        placedPos.y < pos.y) {
                        cout << "Item " << placedItem.id << " at position (" << placedPos.x 
                             << ", " << placedPos.y << ", " << placedPos.z 
                             << ") blocks retrieval of item " << itemId << endl;
                        steps++;
                    }
                }
                
                cout << "Total retrieval steps for item " << itemId << ": " << steps << endl;
                return steps;
            }
        }
        
        cout << "Item " << itemId << " not found in container " << container.id << endl;
        return -1;
    }
};

// Main packing function
unordered_map<string, ContainerState> containerStates;

vector<Placement> packItems(const vector<Item>& items, const vector<Container>& containers) {
    vector<Placement> placements;
    for (const Container& container : containers) {
        containerStates.emplace(container.id, ContainerState(container));
    }
    
    vector<Item> sortedItems = items;
    sort(sortedItems.begin(), sortedItems.end(), [](const Item& a, const Item& b) {
        if (a.priority != b.priority) return a.priorityScore < b.priorityScore;
        return a.volume() > b.volume();
    });
    
    for (const Item& item : sortedItems) {
        bool placed = false;
        cout << "Attempting to place item " << item.id << " with dimensions (" 
             << item.width << "x" << item.depth << "x" << item.height << ")" << endl;

        for (auto& [containerId, state] : containerStates) {
            cout << "Checking container " << containerId << " in zone " << state.container.zone 
                 << " for item " << item.id << endl;

            if (state.container.zone == item.preferredZone) {
                cout << "Container " << containerId << " matches the preferred zone of item " 
                     << item.id << endl;

                Position pos;
                if (state.tryPlaceItem(item, pos)) {
                    cout << "Item " << item.id << " successfully placed in container " 
                         << containerId << " at position (" << pos.x << ", " << pos.y << ", " 
                         << pos.z << ")" << endl;

                    placements.push_back(Placement(
                        item.id, containerId, 
                        pos, 
                        Position(pos.x + item.width, pos.y + item.depth, pos.z + item.height)
                    ));
                    placed = true;
                    break;
                } else {
                    cout << "Failed to place item " << item.id << " in container " 
                         << containerId << endl;
                }
            } else {
                cout << "Container " << containerId << " does not match the preferred zone of item " 
                     << item.id << endl;
            }
        }

        if (!placed) {
            cout << "Attempting to place item " << item.id << " in any available container." << endl;

            for (auto& [containerId, state] : containerStates) {
                Position pos;
                if (state.tryPlaceItem(item, pos)) {
                    cout << "Item " << item.id << " successfully placed in container " 
                         << containerId << " at position (" << pos.x << ", " << pos.y << ", " 
                         << pos.z << ")" << endl;

                    placements.push_back(Placement(
                        item.id, containerId, 
                        pos, 
                        Position(pos.x + item.width, pos.y + item.depth, pos.z + item.height)
                    ));
                    placed = true;
                    break;
                } else {
                    cout << "Failed to place item " << item.id << " in container " 
                         << containerId << endl;
                }
            }
        }

        if (!placed) {
            cout << "Warning: Item " << item.id << " could not be placed in any container. "
                 << "Rearrangement or additional containers may be needed." << endl;
        }
    }

    cout << "Packing process completed. Total placements: " << placements.size() << endl;
    return placements;
}

#include <iostream>
#include <sstream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

using namespace std;

int main() {
    // int noContainers;
    // cout<<"Enter Number of Containers";
    // cin>>noContainers;

    // vector<Container> containers;
    // for(int i = 0; i < noContainers; i++) {
    //     string id, zone;
    //     int width, depth, height;
        
    //     cout << "Enter Container " << i+1 << " ID: ";
    //     cin >> id;
    //     cout << "Enter Container " << i+1 << " Zone: ";
    //     cin.ignore(); 
    //     getline(cin, zone);
    //     cout << "Enter Container " << i+1 << " Width: ";
    //     cin >> width;
    //     cout << "Enter Container " << i+1 << " Depth: ";
    //     cin >> depth;
    //     cout << "Enter Container " << i+1 << " Height: ";
    //     cin >> height;
        
    //     containers.push_back(Container(id, zone, width, depth, height));
    // }
    // int noItems;
    // cout<<"Enter Number of Items";
    // cin>>noItems;
    // vector<Item> items;
    // for(int i = 0; i < noItems; i++) {
    //     string id, name, expiryDate, preferredZone;
    //     int width, depth, height, priority, usageLimit;
        
    //     cout << "Enter Item " << i+1 << " ID: ";
    //     cin >> id;
    //     cout << "Enter Item " << i+1 << " Name: ";
    //     cin.ignore();
    //     getline(cin, name);
    //     cout << "Enter Item " << i+1 << " Width: ";
    //     cin >> width;
    //     cout << "Enter Item " << i+1 << " Depth: ";
    //     cin >> depth;
    //     cout << "Enter Item " << i+1 << " Height: ";
    //     cin >> height;
    //     cout << "Enter Item " << i+1 << " Priority (0-100): ";
    //     cin >> priority;
    //     cout << "Enter Item " << i+1 << " Expiry Date (YYYY-MM-DD): ";
    //     cin >> expiryDate;
    //     cout << "Enter Item " << i+1 << " Usage Limit: ";
    //     cin >> usageLimit;
    //     cout << "Enter Item " << i+1 << " Preferred Zone: ";
    //     cin.ignore();
    //     getline(cin, preferredZone);
        
    //     items.push_back(Item(id, name, width, depth, height, priority, expiryDate, usageLimit, preferredZone));
    // }

    ostringstream inputBuffer;
    string line;

    while(getline(cin, line)) {
        inputBuffer << line << "\n";
    }

    string inputData = inputBuffer.str();

    json containersData = json::parse(inputData)["containers"];
    json itemsData = json::parse(inputData)["items"];

    vector<Item> items;
    vector<Container> containers;
    for (const auto& itemData : itemsData) {
        string id = itemData["itemId"];
        string name = itemData["name"];
        int width = itemData["width"];
        int depth = itemData["depth"];
        int height = itemData["height"];
        int priority = itemData["priority"];
        string expiryDate = itemData["expiryDate"];
        int usageLimit = itemData["usageLimit"];
        string preferredZone = itemData["preferredZone"];
        int priorityScore = itemData["priorityScore"];

        items.push_back(Item(id, name, width, depth, height, priority, expiryDate, usageLimit, preferredZone, priorityScore));
    }

    for (const auto& containerData : containersData) {
        string id = containerData["containerId"];
        string zone = containerData["zone"];
        int width = containerData["width"];
        int depth = containerData["depth"];
        int height = containerData["height"];

        containers.push_back(Container(id, zone, width, depth, height));
    }
    
    vector<Placement> placements = packItems(items, containers);

    json output;

    output["placements"] = json::array();
    for (const auto& placement : placements) {
        json placementJson;
        placementJson["itemId"] = placement.itemId;
        placementJson["containerId"] = placement.containerId;
        placementJson["startPos"] = {placement.startPos.x, placement.startPos.y, placement.startPos.z};
        placementJson["endPos"] = {placement.endPos.x, placement.endPos.y, placement.endPos.z};

        output["placements"].push_back(placementJson);
    }

    output["rearrangements"] = json::array();
    for (const auto& rearrangement : rearrangements) {
        json rearrangementJson;
        rearrangementJson["step"] = rearrangement.step;
        rearrangementJson["action"] = rearrangement.action;
        rearrangementJson["itemId"] = rearrangement.itemId;
        rearrangementJson["fromContainer"] = rearrangement.fromContainer;
        rearrangementJson["fromStartCoordinates"] = {rearrangement.fromStartCoordinates.x, 
                                                     rearrangement.fromStartCoordinates.y, 
                                                     rearrangement.fromStartCoordinates.z};
        rearrangementJson["fromEndCoordinates"] = {rearrangement.fromEndCoordinates.x, 
                                                   rearrangement.fromEndCoordinates.y, 
                                                   rearrangement.fromEndCoordinates.z};
        rearrangementJson["toContainer"] = rearrangement.toContainer;
        rearrangementJson["toStartCoordinates"] = {rearrangement.toStartCoordinates.x, 
                                                   rearrangement.toStartCoordinates.y, 
                                                   rearrangement.toStartCoordinates.z};
        rearrangementJson["toEndCoordinates"] = {rearrangement.toEndCoordinates.x, 
                                                 rearrangement.toEndCoordinates.y, 
                                                 rearrangement.toEndCoordinates.z};

        output["rearrangements"].push_back(rearrangementJson);
    }
    cout << output.dump(4) << endl;
    return 0;
}
