#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <algorithm>
#include <limits>
#include <cmath>
#include <string>
#include <unordered_set>
#include <cstdlib>
#include <ctime>

using namespace std;
struct Position {
    int x, y, z;  
    
    Position(int _x = 0, int _y = 0, int _z = 0) : x(_x), y(_y), z(_z) {}
    
    bool operator==(const Position& other) const {
        return x == other.x && y == other.y && z == other.z;
    }
    
    string toString() const {
        return "(" + to_string(x) + "," + to_string(y) + "," + to_string(z) + ")";
    }
};

namespace std {
    template <>
    struct hash<Position> {
        size_t operator()(const Position& pos) const {
            return hash<int>()(pos.x) ^ hash<int>()(pos.y) ^ hash<int>()(pos.z);
        }
    };
}

struct Item {
    string id;
    string name;
    Position position;
    int width, depth, height;
    Item(){
        
    }
    Item(string _id, string _name, Position _pos, int w, int d, int h)
        : id(_id), name(_name), position(_pos), width(w), depth(d), height(h) {}
    
    bool blocksPath(const Position& target) const {
        
        return position.y < target.y &&
               position.x < target.x + width &&
               position.x + width > target.x &&
               position.z < target.z + height &&
               position.z + height > target.z;
    }

    friend ostream& operator<<(ostream& os, const Item& item) {
        os << "Item(ID: " << item.id 
           << ", Name: " << item.name 
           << ", Position: " << item.position.toString() 
           << ", Width: " << item.width 
           << ", Depth: " << item.depth 
           << ", Height: " << item.height << ")";
        return os;
    }
};


struct Container {
    string id;
    string zone;
    int width, depth, height;
    vector<Item> items;

    Container(){

    }
    
    Container(string _id, string _zone, int w, int d, int h)
        : id(_id), zone(_zone), width(w), depth(d), height(h) {}
    
    void addItem(const Item& item) {
        items.push_back(item);
    }
    
    bool removeItem(const string& itemId) {
        auto it = find_if(items.begin(), items.end(), 
                         [&itemId](const Item& item) { return item.id == itemId; });
        if (it != items.end()) {
            items.erase(it);
            return true;
        }
        return false;
    }
    
    Item* findItem(const string& itemId) {
        auto it = find_if(items.begin(), items.end(), 
                         [&itemId](const Item& item) { return item.id == itemId; });
        if (it != items.end()) {
            return &(*it);
        }
        return nullptr;
    }
    
    bool isWithinBounds(const Position& pos) const {
        return pos.x >= 0 && pos.x < width &&
               pos.y >= 0 && pos.y < depth &&
               pos.z >= 0 && pos.z < height;
    }
    
    bool isOccupied(const Position& pos) const {
        for (const auto& item : items) {
            if (pos.x >= item.position.x && pos.x < item.position.x + item.width &&
                pos.y >= item.position.y && pos.y < item.position.y + item.depth &&
                pos.z >= item.position.z && pos.z < item.position.z + item.height) {
                return true;
            }
        }
        return false;
    }
};

struct RetrievalStep {
    int stepNumber;
    string action;  //remove, setAside, retrieve, placeBack
    string itemId;
    string itemName;
    
    RetrievalStep(int step, string act, string id, string name)
        : stepNumber(step), action(act), itemId(id), itemName(name) {}
};

class RetrievalPathPlanner {
private:
    unordered_map<string, Container> containers;

    vector<Item> findBlockingItems(const Container& container, const Item& targetItem) {
        struct Node {
            Item item;
            int gCost;
            int hCost;
            int fCost() const { return gCost + hCost; }
        };
    
        auto heuristic = [](const Position& a, const Position& b) {
            return abs(a.x - b.x) + abs(a.y - b.y) + abs(a.z - b.z);
        };
    
        vector<Node> openList;
        unordered_map<string, Node> closedList;
    
        for (const auto& item : container.items) {
            if (item.id == targetItem.id) continue;
            if (item.blocksPath(targetItem.position)) {
                int hCost = heuristic(item.position, targetItem.position);
                openList.push_back({item, 0, hCost});
            }
        }
    
        vector<Item> blockingItems;
    
        while (!openList.empty()) {
            sort(openList.begin(), openList.end(), [](const Node& a, const Node& b) {
                return a.fCost() < b.fCost() || (a.fCost() == b.fCost() && a.hCost < b.hCost);
            });
    
            Node currentNode = openList.front();
            openList.erase(openList.begin());
            blockingItems.push_back(currentNode.item);
            closedList[currentNode.item.id] = currentNode;
    
            if (currentNode.item.position.y >= targetItem.position.y) break;
    
            for (const auto& neighbor : container.items) {
                if (neighbor.id == targetItem.id || closedList.count(neighbor.id)) continue;
                if (neighbor.blocksPath(targetItem.position)) {
                    int gCost = currentNode.gCost + 1;
                    int hCost = heuristic(neighbor.position, targetItem.position);
    
                    auto it = find_if(openList.begin(), openList.end(), [&neighbor](const Node& node) {
                        return node.item.id == neighbor.id;
                    });
    
                    if (it == openList.end() || gCost + hCost < it->fCost()) {
                        if (it != openList.end()) openList.erase(it);
                        openList.push_back({neighbor, gCost, hCost});
                    }
                }
            }
        }
    
        return blockingItems;
    }
    
    vector<RetrievalStep> planRetrievalWithDijkstra(const string& containerId, const string& itemId) {
        vector<RetrievalStep> steps;
        
        if (containers.find(containerId) == containers.end()) {
            return steps; 
        }
        
        Container& container = containers[containerId];
        
        Item* targetItem = container.findItem(itemId);
        if (!targetItem) {
            return steps; 
        }
        
        if (targetItem->position.y == 0) {
            steps.push_back(RetrievalStep(1, "retrieve", targetItem->id, targetItem->name));
            return steps;
        }
        
        vector<Item> blockingItems = findBlockingItems(container, *targetItem);
        
        if (blockingItems.empty()) {
            steps.push_back(RetrievalStep(1, "retrieve", targetItem->id, targetItem->name));
            return steps;
        }
        
        int stepCount = 1;
        
        for (const auto& item : blockingItems) {
            steps.push_back(RetrievalStep(stepCount++, "remove", item.id, item.name));
            steps.push_back(RetrievalStep(stepCount++, "setAside", item.id, item.name));
        }
        
        steps.push_back(RetrievalStep(stepCount++, "retrieve", targetItem->id, targetItem->name));
        
        for (auto it = blockingItems.rbegin(); it != blockingItems.rend(); ++it) {
            steps.push_back(RetrievalStep(stepCount++, "placeBack", it->id, it->name));
        }
        
        return steps;
    }
    
    vector<RetrievalStep> planRetrievalWithAStar(const string& containerId, const string& itemId) {
        vector<RetrievalStep> steps;
        
        if (containers.find(containerId) == containers.end()) {
            return steps;  //not found
        }
        
        Container& container = containers[containerId];
        
        Item* targetItem = container.findItem(itemId);
        if (!targetItem) {
            return steps;  //not found
        }
        
        if (isDirectlyAccessible(container, *targetItem)) {
            steps.push_back(RetrievalStep(1, "retrieve", targetItem->id, targetItem->name));
            return steps;
        }
        
        vector<Item> blockingItems = findOptimalRemovalSequence(container, *targetItem);
        
        int stepCount = 1;
        
        for (const auto& item : blockingItems) {
            steps.push_back(RetrievalStep(stepCount++, "remove", item.id, item.name));
            steps.push_back(RetrievalStep(stepCount++, "setAside", item.id, item.name));
        }
        
        steps.push_back(RetrievalStep(stepCount++, "retrieve", targetItem->id, targetItem->name));
        
        for (auto it = blockingItems.rbegin(); it != blockingItems.rend(); ++it) {
            steps.push_back(RetrievalStep(stepCount++, "placeBack", it->id, it->name));
        }
        
        return steps;
    }

    bool isDirectlyAccessible(const Container& container, const Item& item) {
        if (item.position.y == 0) return true;
        
        for (const auto& otherItem : container.items) {
            if (otherItem.id == item.id) continue; 
            
            if (otherItem.blocksPath(item.position)) {
                return false; 
            }
        }
        
        return true; 
    }
    vector<Item> findOptimalRemovalSequence(const Container& container, const Item& targetItem) {
        return findBlockingItems(container, targetItem);
    }
    
    // vector<RetrievalStep> planRetrievalWithACO(const string& containerId, const string& itemId) {
    //     // This would be a more complex implementation using Ant Colony Optimization
    //     // For simplicity, we'll just call the Dijkstra implementation for now
    //     // return planRetrievalWithDijkstra(containerId, itemId);

    // }

    vector<RetrievalStep> planRetrievalWithACO(const string& containerId, const string& itemId) {
        vector<RetrievalStep> steps;
    
        if (containers.find(containerId) == containers.end()) {
            return steps;
        }
    
        Container& container = containers[containerId];
    
        Item* targetItem = container.findItem(itemId);
        if (!targetItem) {
            return steps;
        }
    
        if (isDirectlyAccessible(container, *targetItem)) {
            steps.push_back(RetrievalStep(1, "retrieve", targetItem->id, targetItem->name));
            return steps;
        }
    
        vector<Item> blockingItems = findBlockingItems(container, *targetItem);
    
        if (blockingItems.empty()) {
            steps.push_back(RetrievalStep(1, "retrieve", targetItem->id, targetItem->name));
            return steps;
        }
    
        int stepCount = 1;
    
        unordered_map<string, double> pheromones;
        for (const auto& item : blockingItems) {
            pheromones[item.id] = 1.0;
        }
    
        const int numAnts = 10;
        const int numIterations = 100;
        const double evaporationRate = 0.5;
        const double alpha = 1.0; //pheromone
        const double beta = 2.0;  //proximity
    
        for (int iteration = 0; iteration < numIterations; ++iteration) {
            vector<vector<Item>> antPaths(numAnts);
    
            for (int ant = 0; ant < numAnts; ++ant) {
                unordered_set<string> visited;
                vector<Item> path;
    
                while (path.size() < blockingItems.size()) {
                    vector<pair<Item, double>> probabilities;
    
                    for (const auto& item : blockingItems) {
                        if (visited.count(item.id)) continue;
    
                        double pheromone = pheromones[item.id];
                        double heuristic = 1.0 / (1 + abs(item.position.y - targetItem->position.y));
                        double probability = pow(pheromone, alpha) * pow(heuristic, beta);
                        probabilities.push_back({item, probability});
                    }
    
                    double totalProbability = 0.0;
                    for (const auto& p : probabilities) {
                        totalProbability += p.second;
                    }
    
                    double randomValue = ((double)rand() / RAND_MAX) * totalProbability;
                    double cumulativeProbability = 0.0;
    
                    for (const auto& p : probabilities) {
                        cumulativeProbability += p.second;
                        if (randomValue <= cumulativeProbability) {
                            path.push_back(p.first);
                            visited.insert(p.first.id);
                            break;
                        }
                    }
                }
    
                antPaths[ant] = path;
            }
    
            unordered_map<string, double> newPheromones;
            for (const auto& item : blockingItems) {
                newPheromones[item.id] = pheromones[item.id] * (1 - evaporationRate);
            }
    
            for (const auto& path : antPaths) {
                double pathQuality = 1.0 / path.size();
                for (const auto& item : path) {
                    newPheromones[item.id] += pathQuality;
                }
            }
    
            pheromones = newPheromones;
        }
    
        vector<Item> optimalPath;
        double maxPheromone = 0.0;
        for (const auto& item : blockingItems) {
            if (pheromones[item.id] > maxPheromone) {
                maxPheromone = pheromones[item.id];
                optimalPath.push_back(item);
            }
        }
    
        for (const auto& item : optimalPath) {
            steps.push_back(RetrievalStep(stepCount++, "remove", item.id, item.name));
            steps.push_back(RetrievalStep(stepCount++, "setAside", item.id, item.name));
        }
    
        steps.push_back(RetrievalStep(stepCount++, "retrieve", targetItem->id, targetItem->name));
    
        for (auto it = optimalPath.rbegin(); it != optimalPath.rend(); ++it) {
            steps.push_back(RetrievalStep(stepCount++, "placeBack", it->id, it->name));
        }
    
        return steps;
    }
    
public:
    void addContainer(const Container& container) {
        containers[container.id] = container;
    }
    
    bool addItemToContainer(const string& containerId, const Item& item) {
        if (containers.find(containerId) == containers.end()) {
            return false;  
        }
        
        containers[containerId].addItem(item);
        return true;
    }

    vector<RetrievalStep> planRetrieval(const string& containerId, const string& itemId, const string& algorithm = "astar") {
        if (algorithm == "astar") {
            return planRetrievalWithAStar(containerId, itemId);
        } else if (algorithm == "aco") {
            return planRetrievalWithACO(containerId, itemId);
        } else {
            return planRetrievalWithDijkstra(containerId, itemId);
        }
    }
    
    const unordered_map<string, Container>& getContainers() const {
        return containers;
    }
};

#include <iostream>
#include <sstream>
#include "json.hpp"
using json = nlohmann::json;

using namespace std;

int main() {
    RetrievalPathPlanner planner;
    
    // Create a container
    // Container container("contA", "Crew Quarters", 100, 85, 200);
    
    // // Add items to the container
    // Item item1("001", "Food Packet", Position(0, 0, 0), 10, 10, 20);
    // Item item2("002", "Oxygen Cylinder", Position(20, 0, 0), 15, 15, 50);
    // Item item3("003", "First Aid Kit", Position(40, 20, 0), 20, 20, 10);
    // Item item4("004", "Tool Box", Position(40, 0, 0), 30, 10, 15);
    // Item item5("005", "Water Container", Position(10, 10, 10), 15, 15, 25);
    // Item item6("006", "Science Equipment", Position(50, 30, 0), 20, 20, 30);
    // Item item7("007", "Clothing Pack", Position(70, 0, 0), 15, 10, 10);
    // Item item8("008", "Communication Device", Position(0, 20, 0), 10, 10, 5);
    // Item item9("009", "Emergency Beacon", Position(60, 0, 10), 10, 10, 15);
    // Item item10("010", "Medical Supplies", Position(30, 30, 10), 15, 15, 20);
    // Item item11("011", "Spare Parts", Position(80, 10, 0), 20, 15, 20);
    // Item item12("012", "Research Samples", Position(20, 40, 0), 10, 10, 10);
    
    // container.addItem(item1);
    // container.addItem(item2);
    // container.addItem(item3);
    // container.addItem(item4);
    // container.addItem(item5);
    // container.addItem(item6);
    // container.addItem(item7);
    // container.addItem(item8);
    // container.addItem(item9);
    // container.addItem(item10);
    // container.addItem(item11);
    // container.addItem(item12);
    
    // Add the container to the planner
    ostringstream inputBuffer;
    string line;

    while(getline(cin, line)) {
        inputBuffer << line << "\n";
    }

    string inputData = inputBuffer.str();

    // cout<<"Input Data: "<<inputData<<endl;

    json inputJson = json::parse(inputData);

    json container = inputJson["container"];

    // cout<<"Container: "<<container.dump(4)<<endl;

    string itemId = inputJson["itemId"];

    // cout<<"Item ID: "<<itemId<<endl;
    
    Container parsedContainer(
        container["containerId"],
        container["zone"],
        container["width"],
        container["depth"],
        container["height"]
    );

    // cout<<"Parsed Container: "<<parsedContainer.id<<endl;

    vector<json> item_data;

    for (const auto& item : container["items"]) {
        // cout<<"item: "<<item.dump(4)<<endl;
        json itemDetails = item;
        if (!itemDetails.is_null()) {
            Item item_x = Item(
                itemDetails["itemId"],
                itemDetails["name"],
                Position(
                    itemDetails["startPos"]["x"],
                    itemDetails["startPos"]["y"],
                    itemDetails["startPos"]["z"]
                ),
                itemDetails["width"],
                itemDetails["depth"],
                itemDetails["height"]
            );

            // cout<<item_x<<endl;
            parsedContainer.addItem(item_x);
        }
    }

    // cout<<"Item data: "<<item_data[0].dump(4)<<endl;

    // cout<<"Parsed Container Items: "<<endl;
    // for (const auto& item : parsedContainer.items) {
    //     cout << "Item ID: " << item.id << ", Name: " << item.name << ", Position: " << item.position.toString() << endl;
    // }

    planner.addContainer(parsedContainer);

    // Plan retrieval for an item
    vector<RetrievalStep> steps = planner.planRetrieval(parsedContainer.id, itemId, "astar");

    if(steps.empty()){
        cout<<"No steps found for the given item."<<endl;
        return 0;
    }

    json output;

    for (const auto& step : steps) {
        json stepJson;
        stepJson["stepNumber"] = step.stepNumber;
        stepJson["action"] = step.action;
        stepJson["itemId"] = step.itemId;
        stepJson["itemName"] = step.itemName;
        output.push_back(stepJson);
    }

    cout << output.dump(4) << endl;


    return 0;
}
