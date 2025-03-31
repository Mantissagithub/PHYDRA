#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <chrono>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <queue>
#include <unordered_map>
#include <ctype.h>
using namespace std;

class PriorityCalculator {
private:
    const double PRIORITY_WEIGHT = 0.3;
    const double EXPIRY_WEIGHT = 0.2;
    const double USAGE_WEIGHT = 0.1;
    const double ZONE_WEIGHT = 0.1;
    const double TYPE_WEIGHT = 0.1;
    const double MASS_WEIGHT = 0.1;
    const double VOLUME_WEIGHT = 0.1;

    int daysUntilExpiry(const std::string& expiryDate) {
        // Handle N/A case
        if (expiryDate == "N/A") return 999999; 
        
        std::tm tm = {};
        std::istringstream ss(expiryDate);
        ss >> std::get_time(&tm, "%Y-%m-%d");
        auto expiry = std::chrono::system_clock::from_time_t(std::mktime(&tm));
        
        // std::tm current_tm = {};
        auto now = std::chrono::system_clock::now();
        auto now_time_t = std::chrono::system_clock::to_time_t(now);
        auto now_tm = *std::localtime(&now_time_t);
        std::ostringstream oss;
        oss << std::setw(4) << std::setfill('0') << (now_tm.tm_year + 1900) << "-"
            << std::setw(2) << std::setfill('0') << (now_tm.tm_mon + 1) << "-"
            << std::setw(2) << std::setfill('0') << now_tm.tm_mday;
        std::string formattedDate = oss.str();
        std::tm currentDate = {};
        std::sscanf(formattedDate.c_str(), "%d-%d-%d", &currentDate.tm_year, &currentDate.tm_mon, &currentDate.tm_mday);
        currentDate.tm_year -= 1900; 
        currentDate.tm_mon -= 1;  
        auto current_tm = currentDate;
        now = std::chrono::system_clock::from_time_t(std::mktime(&current_tm));
        
        return std::chrono::duration_cast<std::chrono::hours>(expiry - now).count() / 24;
    }

public:
    double calculatePriorityScore(int itemPriority, const std::string& expiryDate, 

/*************  ✨ Codeium Command ⭐  *************/
    /**
     * Calculates a priority score based on the following factors:
     * 1. Item priority (higher is better)
     * 2. Expiry date (closer to expiry is better)
     * 3. Usage limit (higher is better)
     * 4. Preferred zone (in preferred zone is better)
     * 5. Item type (consumables, equipment, payload, or unknown; unknown is worst)
     * 6. Mass (higher is better)
     * 7. Volume (smaller is better)
     *
     * The scores are calculated using the following weights and formulas:
     * 1. Item priority score: itemPriority / 100.0
     * 2. Expiry score: exp(-0.05 * daysToExpiry)
     * 3. Usage limit score: 1.0 / (1.0 + usageLimit)
     * 4. Preferred zone score: inPreferredZone ? 1.0 : 0.5
     * 5. Item type score: type-dependent, with consumables best and unknown worst
     * 6. Mass score: 1.0 - exp(-0.01 * mass)
     * 7. Volume score: exp(-0.01 * volume)
     *
     * The weighted sum of these scores is then returned as the priority score.
     */
/******  fe40ce1b-aba8-4044-9d99-650e120a09c3  *******/                                  int usageLimit, bool inPreferredZone, 
                                  const std::string& itemType, double mass, double volume) {
        // 1. Item Priority Score
        double priorityScore = itemPriority / 100.0;

        // 2. Expiry Date Score
        int daysToExpiry = daysUntilExpiry(expiryDate);
        double expiryScore = std::exp(-0.05 * daysToExpiry); // Exponential decay

        // 3. Usage Limit Score
        double usageScore = 1.0 / (1.0 + usageLimit); // Inverse relationship

        // 4. Preferred Zone Score
        double zoneScore = inPreferredZone ? 1.0 : 0.5;

        // // 5. Item Type Score
        // double typeScore;
        // if (itemType == "consumables") typeScore = 0.8;
        // else if (itemType == "equipment") typeScore = 0.6;
        // else if (itemType == "payload") typeScore = 1.0;
        // else typeScore = 0.5;

        // 6. Mass Score (assuming higher mass means higher priority)
        double massScore = 1.0 - std::exp(-0.01 * mass);

        // 7. Volume Score (assuming smaller volume means higher priority)
        double volumeScore = std::exp(-0.01 * volume);

        // Calculate weighted sum
        double totalScore = 
            PRIORITY_WEIGHT * priorityScore +
            EXPIRY_WEIGHT * expiryScore +
            USAGE_WEIGHT * usageScore +
            ZONE_WEIGHT * zoneScore +
            // TYPE_WEIGHT * typeScore +
            MASS_WEIGHT * massScore +
            VOLUME_WEIGHT * volumeScore;

        return totalScore;
    }
};

class Item {
public:
    std::string id;
    std::string name;
    int width, depth, height;
    double mass;
    int priority;
    std::string expiryDate;
    int usageLimit;
    std::string preferredZone;
    std::string itemType;
    std::string currentZone;
    double priorityScore;
    Item(){}
    Item(std::string id, std::string name, int w, int d, int h, double m, 
         int p, std::string exp, int usage, std::string pZone, std::string type)
        : id(id), name(name), width(w), depth(d), height(h), mass(m),
          priority(p), expiryDate(exp), usageLimit(usage), preferredZone(pZone),
          currentZone(""), priorityScore(0.0) {}

    double volume() const {
        return width * depth * height;
    }

    void calculatePriorityScore(PriorityCalculator& calculator) {
        priorityScore = calculator.calculatePriorityScore(
            priority, expiryDate, usageLimit, 
            (currentZone == preferredZone), itemType, mass, volume()
        );
    }
};

class ItemPriorityQueue {
private:
    struct CompareItem {
        bool operator()(const Item& a, const Item& b) {
            return a.priorityScore < b.priorityScore;
        }
    };

    std::priority_queue<Item, std::vector<Item>, CompareItem> pq;

public:
    void addItem(const Item& item) {
        pq.push(item);
    }

    Item getTopPriorityItem() {
        if (pq.empty()) {
            throw std::runtime_error("Priority queue is empty");
        }
        Item top = pq.top();
        pq.pop();
        return top;
    }

    bool isEmpty() const {
        return pq.empty();
    }

    size_t size() const {
        return pq.size();
    }
    
    std::vector<Item> getAllItemsSorted() {
        std::vector<Item> sortedItems;
        std::priority_queue<Item, std::vector<Item>, CompareItem> tempQueue = pq;
        
        while (!tempQueue.empty()) {
            sortedItems.push_back(tempQueue.top());
            tempQueue.pop();
        }
        
        return sortedItems;
    }
};

std::unordered_map<std::string, Item> itemsMap;
class PriorityCalculationEngine {
private:
    PriorityCalculator calculator;
    ItemPriorityQueue priorityQueue;

public:
    void addItem(const Item& item) {
        Item itemCopy = item;
        itemCopy.calculatePriorityScore(calculator);
        priorityQueue.addItem(itemCopy);
        itemsMap[itemCopy.id] = itemCopy;
    }

    Item getNextPriorityItem() {
        return priorityQueue.getTopPriorityItem();
    }

    void updateItemPriority(Item& item) {
        item.calculatePriorityScore(calculator);
    }

    size_t itemCount() const {
        return priorityQueue.size();
    }
    
    std::vector<Item> getAllItemsSortedByPriority() {
        return priorityQueue.getAllItemsSorted();
    }
    
    Item* getItemById(const std::string& id) {
        auto it = itemsMap.find(id);
        if (it != itemsMap.end()) {
            return &(it->second);
        }
        return nullptr;
    }
    
    void updateItemZone(const std::string& id, const std::string& zone) {
        auto it = itemsMap.find(id);
        if (it != itemsMap.end()) {
            it->second.currentZone = zone;
            it->second.calculatePriorityScore(calculator);
            
            // Rebuild priority queue with updated item
            std::vector<Item> allItems;
            while (!priorityQueue.isEmpty()) {
                allItems.push_back(priorityQueue.getTopPriorityItem());
            }
            
            for (const auto& item : allItems) {
                if (item.id == id) {
                    priorityQueue.addItem(it->second);
                } else {
                    priorityQueue.addItem(item);
                }
            }
        }
    }
    
    void decrementUsageLimit(const std::string& id) {
        auto it = itemsMap.find(id);
        if (it != itemsMap.end() && it->second.usageLimit > 0) {
            it->second.usageLimit--;
            it->second.calculatePriorityScore(calculator);
            
            // Rebuild priority queue with updated item
            std::vector<Item> allItems;
            while (!priorityQueue.isEmpty()) {
                allItems.push_back(priorityQueue.getTopPriorityItem());
            }
            
            for (const auto& item : allItems) {
                if (item.id == id) {
                    priorityQueue.addItem(it->second);
                } else {
                    priorityQueue.addItem(item);
                }
            }
        }
    }
    
    std::vector<Item> getWasteItems() {
        std::vector<Item> wasteItems;
        std::vector<Item> allItems = priorityQueue.getAllItemsSorted();
        
        // Current date: March 31, 2025
        std::tm current_tm = {};
        current_tm.tm_year = 2025 - 1900;
        current_tm.tm_mon = 3 - 1;
        current_tm.tm_mday = 31;
        auto now = std::chrono::system_clock::from_time_t(std::mktime(&current_tm));
        
        for (const auto& item : allItems) {
            // Check if item is expired
            if (item.expiryDate != "N/A") {
                std::tm tm = {};
                std::istringstream ss(item.expiryDate);
                ss >> std::get_time(&tm, "%Y-%m-%d");
                auto expiry = std::chrono::system_clock::from_time_t(std::mktime(&tm));
                
                if (expiry <= now) {
                    wasteItems.push_back(item);
                    continue;
                }
            }

            if (item.usageLimit <= 0) {
                wasteItems.push_back(item);
            }
        }
        
        return wasteItems;
    }
};

int main() {
    PriorityCalculationEngine engine;

    cout<<"Worked!!!";
    // Add items
    int n;
    cout<<"Enter The Number of Items : ";
    cin>>n;
    for(int i=0;i<n;i++){
        std::string id, name, expiryDate, preferredZone, itemType;
        int width, depth, height, priority, usageLimit;
        double mass;

        std::cout << "Enter Item ID: ";
        std::cin >> id;
        std::cin.ignore(); // Clear newline from buffer

        std::cout << "Enter Item Name: ";
        std::getline(std::cin, name);

        std::cout << "Enter Width, Depth, Height (in cm): ";
        std::cin >> width >> depth >> height;

        std::cout << "Enter Mass (in kg): ";
        std::cin >> mass;

        std::cout << "Enter Priority (1-100): ";
        std::cin >> priority;

        std::cout << "Enter Expiry Date (YYYY-MM-DD or N/A): ";
        std::cin >> expiryDate;

        std::cout << "Enter Usage Limit: ";
        std::cin >> usageLimit;

        std::cout << "Enter Preferred Zone: ";
        std::cin.ignore(); // Clear newline from buffer
        std::getline(std::cin, preferredZone);

        std::cout << "Enter Item Type (consumables/equipment/payload): ";
        std::getline(std::cin, itemType);

        engine.addItem(Item(id, name, width, depth, height, mass, priority, expiryDate, usageLimit, preferredZone, itemType));
    }
    // engine.addItem(Item("001", "Food Packet", 10, 10, 20, 5, 80, "2025-05-20", 30, "Crew Quarters", "consumables"));
    // engine.addItem(Item("002", "Oxygen Cylinder", 15, 15, 50, 30, 95, "N/A", 100, "Airlock", "equipment"));
    // engine.addItem(Item("003", "First Aid Kit", 20, 20, 10, 2, 100, "2025-07-10", 5, "Medical Bay", "consumables"));
    // engine.addItem(Item("004", "Space Suit", 50, 40, 20, 15, 90, "2026-03-15", 50, "Airlock", "equipment"));
    // engine.addItem(Item("005", "Science Experiment", 30, 30, 30, 8, 75, "2025-04-01", 10, "Laboratory", "payload"));
    // engine.addItem(Item("006", "Water Filter", 15, 15, 25, 3, 85, "2025-08-30", 200, "Life Support", "equipment"));
    // engine.addItem(Item("007", "Emergency Rations", 10, 20, 5, 1, 70, "2025-01-15", 5, "Storage", "consumables"));
    // engine.addItem(Item("008", "Solar Panel", 100, 80, 5, 25, 60, "N/A", 1000, "Exterior", "equipment"));
    // engine.addItem(Item("009", "Medical Supplies", 25, 25, 15, 4, 95, "2025-02-01", 20, "Medical Bay", "consumables"));
    // engine.addItem(Item("010", "Communication Device", 8, 15, 3, 0.5, 88, "N/A", 500, "Command Center", "equipment"));

    
    // Update item zones based on entered data
    for (const auto& item : itemsMap) {
        // Initially place items in their preferred zones when possible
        engine.updateItemZone(item.second.id, item.second.preferredZone);
    }

    std::cout << "Items sorted by priority score:" << std::endl;
    std::vector<Item> sortedItems = engine.getAllItemsSortedByPriority();
    for (const auto& item : sortedItems) {
        std::cout << "Item: " << item.name << " (ID: " << item.id << ")" << std::endl;
        std::cout << "  Priority: " << item.priority << std::endl;
        std::cout << "  Priority Score: " << item.priorityScore << std::endl;
        std::cout << "  Preferred Zone: " << item.preferredZone << std::endl;
        std::cout << "  Current Zone: " << item.currentZone << std::endl;
        std::cout << "  Expiry Date: " << item.expiryDate << std::endl;
        std::cout << "  Usage Limit: " << item.usageLimit << std::endl;
        std::cout << std::endl;
    }

    std::cout << "Simulating usage of First Aid Kit (ID: 003)" << std::endl;
    engine.decrementUsageLimit("003");
    
    Item* updatedItem = engine.getItemById("003");
    if (updatedItem) {
        std::cout << "Updated Usage Limit: " << updatedItem->usageLimit << std::endl;
    }
    
    std::cout << "\nChecking for waste items:" << std::endl;
    std::vector<Item> wasteItems = engine.getWasteItems();
    if (wasteItems.empty()) {
        std::cout << "No waste items found." << std::endl;
    } else {
        for (const auto& item : wasteItems) {
            std::cout << "Waste Item: " << item.name << " (ID: " << item.id << ")" << std::endl;
            std::cout << "  Reason: " << (item.usageLimit <= 0 ? "Out of Uses" : "Expired") << std::endl;
        }
    }

    return 0;
}
