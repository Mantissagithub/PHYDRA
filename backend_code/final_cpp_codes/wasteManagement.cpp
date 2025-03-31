#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <chrono>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <unordered_map>
#include <climits>
using namespace std;

struct Item;
struct Container;

const chrono::system_clock::time_point CURRENT_DATE = []() {
    tm timeinfo = {};
    timeinfo.tm_year = 2025 - 1900;
    timeinfo.tm_mon = 3 - 1;
    timeinfo.tm_mday = 31;
    timeinfo.tm_hour = 10;
    timeinfo.tm_min = 26;
    return chrono::system_clock::from_time_t(mktime(&timeinfo));
}();

struct Item {
    string id;
    string name;
    int width, depth, height;
    double mass;
    int priority;
    string expiryDate;
    int usageLimit;
    string preferredZone;
    string containerId;
    string wasteReason;
    Item(){}
    
    struct Position {
        int x, y, z;
        Position(int _x = 0, int _y = 0, int _z = 0) : x(_x), y(_y), z(_z) {}
    } position;
    
    Item(string _id, string _name, int w, int d, int h, double m, 
         int p, string exp, int usage, string pZone) 
        : id(_id), name(_name), width(w), depth(d), height(h), mass(m),
          priority(p), expiryDate(exp), usageLimit(usage), preferredZone(pZone),
          containerId(""), wasteReason("") {}
    
    double volume() const {
        return width * depth * height;
    }
    
    bool isExpired() const {
        if (expiryDate == "N/A") return false;
        
        tm tm_expiry = {};
        istringstream ss(expiryDate);
        ss >> get_time(&tm_expiry, "%Y-%m-%d");
        auto expiry_date = chrono::system_clock::from_time_t(mktime(&tm_expiry));
        
        return expiry_date <= CURRENT_DATE;
    }
    
    bool isOutOfUses() const {
        return usageLimit <= 0;
    }
    
    bool isWaste() const {
        return isExpired() || isOutOfUses();
    }
};

// Container structure
struct Container {
    string id;
    string zone;
    int width, depth, height;
    Container(){}
    Container(string _id, string _zone, int w, int d, int h) 
        : id(_id), zone(_zone), width(w), depth(d), height(h) {}
    
    double volume() const {
        return width * depth * height;
    }
};

class WasteManagementOptimizer {
private:
    unordered_map<string, Item> itemsDatabase;
    unordered_map<string, Container> containersDatabase;
    
    int daysUntilExpiry(const string& expiryDate) const {
        if (expiryDate == "N/A") return INT_MAX;
        
        tm tm_expiry = {};
        istringstream ss(expiryDate);
        ss >> get_time(&tm_expiry, "%Y-%m-%d");
        auto expiry_date = chrono::system_clock::from_time_t(mktime(&tm_expiry));
        
        auto diff = chrono::duration_cast<chrono::hours>(expiry_date - CURRENT_DATE).count();
        return diff / 24;
    }
    
    bool isItemAccessible(const Item& item) const {
        for (const auto& [id, otherItem] : itemsDatabase) {
            if (id == item.id || otherItem.containerId != item.containerId) continue;
            
            if (otherItem.position.y < item.position.y && 
                otherItem.position.x < item.position.x + item.width && 
                otherItem.position.x + otherItem.width > item.position.x &&
                otherItem.position.z < item.position.z + item.height && 
                otherItem.position.z + otherItem.height > item.position.z) {
                return false;
            }
        }
        return true;
    }
    
    vector<Item> getBlockingItems(const Item& item) const {
        vector<Item> blockingItems;
        
        for (const auto& [id, otherItem] : itemsDatabase) {
            if (id == item.id || otherItem.containerId != item.containerId) continue;
            
            if (otherItem.position.y < item.position.y && 
                otherItem.position.x < item.position.x + item.width && 
                otherItem.position.x + otherItem.width > item.position.x &&
                otherItem.position.z < item.position.z + item.height && 
                otherItem.position.z + otherItem.height > item.position.z) {
                blockingItems.push_back(otherItem);
            }
        }
        
        return blockingItems;
    }
    
public:
    void addItem(const Item& item) {
        itemsDatabase[item.id] = item;
    }
    
    void addContainer(const Container& container) {
        containersDatabase[container.id] = container;
    }
    
    void updateItemPosition(const string& itemId, const string& containerId, int x, int y, int z) {
        if (itemsDatabase.find(itemId) != itemsDatabase.end()) {
            itemsDatabase[itemId].containerId = containerId;
            itemsDatabase[itemId].position.x = x;
            itemsDatabase[itemId].position.y = y;
            itemsDatabase[itemId].position.z = z;
        }
    }
    
    void useItem(const string& itemId) {
        if (itemsDatabase.find(itemId) != itemsDatabase.end() && itemsDatabase[itemId].usageLimit > 0) {
            itemsDatabase[itemId].usageLimit--;
        }
    }
    
    vector<Item> identifyWasteItems() const {
        vector<Item> wasteItems;
        
        for (const auto& [id, item] : itemsDatabase) {
            if (item.isWaste()) {
                Item wasteItem = item;
                if (item.isExpired()) {
                    wasteItem.wasteReason = "Expired";
                } else if (item.isOutOfUses()) {
                    wasteItem.wasteReason = "Out of Uses";
                }
                wasteItems.push_back(wasteItem);
            }
        }
        
        return wasteItems;
    }
    
    struct ReturnPlan {
        struct Step {
            int stepNumber;
            string itemId;
            string itemName;
            string fromContainer;
            string toContainer;
        };
        
        struct RetrievalStep {
            int stepNumber;
            string action;
            string itemId;
            string itemName;
        };
        
        struct Manifest {
            string undockingContainerId;
            string undockingDate;
            vector<tuple<string, string, string>> returnItems; // itemId, name, reason
            double totalVolume;
            double totalWeight;
        };
        
        vector<Step> steps;
        vector<RetrievalStep> retrievalSteps;
        Manifest manifest;
    };
    
    ReturnPlan generateReturnPlan(const string& undockingContainerId, const string& undockingDate, double maxWeight) {
        ReturnPlan plan;
        plan.manifest.undockingContainerId = undockingContainerId;
        plan.manifest.undockingDate = undockingDate;
        plan.manifest.totalVolume = 0;
        plan.manifest.totalWeight = 0;
        
        vector<Item> wasteItems = identifyWasteItems();
        
        sort(wasteItems.begin(), wasteItems.end(), [](const Item& a, const Item& b) {
            return a.priority > b.priority;
        });
        
        int stepCount = 1;
        int retrievalStepCount = 1;
        
        for (const auto& item : wasteItems) {
            if (plan.manifest.totalWeight + item.mass > maxWeight) {
                continue;
            }
            
            ReturnPlan::Step step;
            step.stepNumber = stepCount++;
            step.itemId = item.id;
            step.itemName = item.name;
            step.fromContainer = item.containerId;
            step.toContainer = undockingContainerId;
            plan.steps.push_back(step);
            
            plan.manifest.returnItems.push_back(make_tuple(item.id, item.name, item.wasteReason));
            plan.manifest.totalVolume += item.volume();
            plan.manifest.totalWeight += item.mass;
            
            if (!isItemAccessible(item)) {
                vector<Item> blockingItems = getBlockingItems(item);
                
                for (const auto& blockingItem : blockingItems) {
                    ReturnPlan::RetrievalStep removeStep;
                    removeStep.stepNumber = retrievalStepCount++;
                    removeStep.action = "remove";
                    removeStep.itemId = blockingItem.id;
                    removeStep.itemName = blockingItem.name;
                    plan.retrievalSteps.push_back(removeStep);
                    
                    ReturnPlan::RetrievalStep setAsideStep;
                    setAsideStep.stepNumber = retrievalStepCount++;
                    setAsideStep.action = "setAside";
                    setAsideStep.itemId = blockingItem.id;
                    setAsideStep.itemName = blockingItem.name;
                    plan.retrievalSteps.push_back(setAsideStep);
                }
                
                ReturnPlan::RetrievalStep retrieveStep;
                retrieveStep.stepNumber = retrievalStepCount++;
                retrieveStep.action = "retrieve";
                retrieveStep.itemId = item.id;
                retrieveStep.itemName = item.name;
                plan.retrievalSteps.push_back(retrieveStep);
                
                for (auto it = blockingItems.rbegin(); it != blockingItems.rend(); ++it) {
                    ReturnPlan::RetrievalStep placeBackStep;
                    placeBackStep.stepNumber = retrievalStepCount++;
                    placeBackStep.action = "placeBack";
                    placeBackStep.itemId = it->id;
                    placeBackStep.itemName = it->name;
                    plan.retrievalSteps.push_back(placeBackStep);
                }
            } else {
                ReturnPlan::RetrievalStep retrieveStep;
                retrieveStep.stepNumber = retrievalStepCount++;
                retrieveStep.action = "retrieve";
                retrieveStep.itemId = item.id;
                retrieveStep.itemName = item.name;
                plan.retrievalSteps.push_back(retrieveStep);
            }
        }
        
        return plan;
    }
    
    int completeUndocking(const string& undockingContainerId) {
        int itemsRemoved = 0;
        vector<string> itemsToRemove;
        
        for (const auto& [id, item] : itemsDatabase) {
            if (item.containerId == undockingContainerId) {
                itemsToRemove.push_back(id);
            }
        }
        
        for (const auto& id : itemsToRemove) {
            itemsDatabase.erase(id);
            itemsRemoved++;
        }
        
        return itemsRemoved;
    }
    
    struct ProcessedWaste {
        string itemId;
        double originalVolume;
        double processedVolume;
        double waterRecovered;
        double finalMass;
    };
    
    ProcessedWaste processWasteItem(const Item& item) {
        const double VOLUME_REDUCTION_FACTOR = 0.75;
        const double WATER_RECOVERY_RATE = 0.98;     
        
        ProcessedWaste result;
        result.itemId = item.id;
        result.originalVolume = item.volume();
        
        double waterContent = item.mass * 0.15;
        result.waterRecovered = waterContent * WATER_RECOVERY_RATE;
        
        result.processedVolume = result.originalVolume * (1 - VOLUME_REDUCTION_FACTOR);
        result.finalMass = item.mass - result.waterRecovered;
        
        return result;
    }
    
    // Get all items
    const unordered_map<string, Item>& getAllItems() const {
        return itemsDatabase;
    }
    
    // Get all containers
    const unordered_map<string, Container>& getAllContainers() const {
        return containersDatabase;
    }
};

// Example usage
int main() {
    WasteManagementOptimizer optimizer;
    
    // Add containers
    optimizer.addContainer(Container("contA", "Crew Quarters", 100, 85, 200));
    optimizer.addContainer(Container("contB", "Airlock", 50, 85, 200));
    optimizer.addContainer(Container("contC", "Laboratory", 200, 85, 200));
    optimizer.addContainer(Container("contD", "Return Module", 150, 85, 150));
    
    // Add items
    Item item1("001", "Food Packet", 10, 10, 20, 5, 80, "2025-05-20", 30, "Crew Quarters");
    Item item2("002", "Oxygen Cylinder", 15, 15, 50, 30, 95, "N/A", 100, "Airlock");
    Item item3("003", "First Aid Kit", 20, 20, 10, 2, 100, "2025-07-10", 5, "Medical Bay");
    Item item4("004", "Expired Food", 10, 10, 20, 5, 60, "2025-03-15", 10, "Crew Quarters");
    Item item5("005", "Used Tool", 15, 10, 5, 1, 70, "N/A", 0, "Laboratory");
    
    optimizer.addItem(item1);
    optimizer.addItem(item2);
    optimizer.addItem(item3);
    optimizer.addItem(item4);
    optimizer.addItem(item5);
    
    // Update item positions
    optimizer.updateItemPosition("001", "contA", 0, 0, 0);
    optimizer.updateItemPosition("002", "contB", 0, 0, 0);
    optimizer.updateItemPosition("003", "contC", 0, 0, 0);
    optimizer.updateItemPosition("004", "contA", 10, 0, 0);
    optimizer.updateItemPosition("005", "contC", 20, 0, 0);
    
    // Identify waste items
    cout << "Identifying waste items..." << endl;
    vector<Item> wasteItems = optimizer.identifyWasteItems();
    
    cout << "Found " << wasteItems.size() << " waste items:" << endl;
    for (const auto& item : wasteItems) {
        cout << "- " << item.name << " (ID: " << item.id << "): " << item.wasteReason << endl;
    }
    
    // Generate return plan
    cout << "\nGenerating return plan..." << endl;
    auto returnPlan = optimizer.generateReturnPlan("contD", "2025-04-15", 100.0);
    
    cout << "Return plan contains " << returnPlan.steps.size() << " steps:" << endl;
    for (const auto& step : returnPlan.steps) {
        cout << "Step " << step.stepNumber << ": Move " << step.itemName 
             << " from " << step.fromContainer << " to " << step.toContainer << endl;
    }
    
    cout << "\nRetrieval steps:" << endl;
    for (const auto& step : returnPlan.retrievalSteps) {
        cout << "Step " << step.stepNumber << ": " << step.action << " " 
             << step.itemName << " (ID: " << step.itemId << ")" << endl;
    }
    
    cout << "\nReturn manifest:" << endl;
    cout << "Undocking container: " << returnPlan.manifest.undockingContainerId << endl;
    cout << "Undocking date: " << returnPlan.manifest.undockingDate << endl;
    cout << "Total volume: " << returnPlan.manifest.totalVolume << " cubic cm" << endl;
    cout << "Total weight: " << returnPlan.manifest.totalWeight << " kg" << endl;
    
    cout << "\nItems to return:" << endl;
    for (const auto& [id, name, reason] : returnPlan.manifest.returnItems) {
        cout << "- " << name << " (ID: " << id << "): " << reason << endl;
    }
    
    // Process a waste item
    cout << "\nProcessing waste item..." << endl;
    if (!wasteItems.empty()) {
        auto processed = optimizer.processWasteItem(wasteItems[0]);
        cout << "Processed " << wasteItems[0].name << ":" << endl;
        cout << "Original volume: " << processed.originalVolume << " cubic cm" << endl;
        cout << "Processed volume: " << processed.processedVolume << " cubic cm" << endl;
        cout << "Volume reduction: " << (processed.originalVolume - processed.processedVolume) 
             << " cubic cm (" << (1 - processed.processedVolume/processed.originalVolume)*100 << "%)" << endl;
        cout << "Water recovered: " << processed.waterRecovered << " kg" << endl;
        cout << "Final mass: " << processed.finalMass << "kg" << endl;
    }

    // Complete undocking
    cout << "\nCompleting undocking..." << endl;
    int itemsRemoved = optimizer.completeUndocking("contD");
    cout << "Removed " << itemsRemoved << " items from container contD." << endl;
    cout << "Remaining items in the system: " << optimizer.getAllItems().size() << endl;
    return 0;
}
