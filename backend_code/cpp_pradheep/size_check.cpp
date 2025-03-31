#include <iostream>
#include <string>
#include <vector>
#include <tuple>
#include <unordered_map>

using namespace std;

struct Container {
    int remaining_capacity;
    int total_capacity;
    bool temp_container;
    tuple<int, int, int> dimensions;
    vector<string> items;
};

struct Zone {
    tuple<int, int, int> dimensions;
    vector<string> containers_id;
    int count;
    bool temp_zone;
    string temp_container_id;
};

struct Item {
    string name;
    tuple<int, int, int> dimensions;
    int priority;
    string expiry_date;
    int usage_limit;
    string preferred_zone;
    string kept_zone;
};

unordered_map<string, Zone> zones;
unordered_map<string, Container> containers;
unordered_map<string, Item> items;

int main() {
    cout << "Implementing size check..." << endl;
    
    int item_count = 0;
    
    for(int i = 0; i < 1000; i++) {
        int x = rand() % 50 + 1;
        int y = rand() % 50 + 1;
        int z = rand() % 50 + 1;
        items["item" + to_string(i)] = {"Item " + to_string(i), {x, y, z}, i % 5, "2026-01-01", 100, "zone" + to_string(i % 10), ""};
    }
    
    // Create 10 zones
    for(int i = 0; i < 10; i++) {
        zones["zone" + to_string(i)] = {{1000, 1000, 1000}, {}, 0, false, ""};
    }
    
    // Create 50 containers with different sizes
    for(int i = 0; i < 50; i++) {
        int x = rand() % 100 + 50;
        int y = rand() % 100 + 50;
        int z = rand() % 100 + 50;
        containers["cont" + to_string(i)] = {2000, 2000, false, {x, y, z}, {}};
    }

    for (auto& item : items) {
        string zoneId = item.second.preferred_zone;
        bool placed = false;

        for (auto& container : containers) {
            if (!container.second.temp_container) {
                int x1 = get<0>(container.second.dimensions);
                int y1 = get<1>(container.second.dimensions);
                int z1 = get<2>(container.second.dimensions);
                int x = get<0>(item.second.dimensions);
                int y = get<1>(item.second.dimensions);
                int z = get<2>(item.second.dimensions);

                if (x1 >= x && y1 >= y && z1 >= z) {
                    container.second.items.push_back(zoneId + container.first + item.first);
                    cout << "Item " << item.second.name << " added to container " << container.first << endl;
                    placed = true;
                    break;
                }
            }
        }

        if (!placed) {
            string newKey = "cont" + to_string(containers.size()) + zoneId;
            containers[newKey] = {1000, 1000, false, item.second.dimensions, {}};
            containers[newKey].items.push_back(zoneId + newKey + item.first);
            cout << "New container created for item " << item.second.name << " with dimensions: " 
                 << get<0>(item.second.dimensions) << "+" 
                 << get<1>(item.second.dimensions) << "+" 
                 << get<2>(item.second.dimensions) << endl;
            cout << "Item " << item.second.name << " added to container " << newKey << endl;
        }
        item_count++;
    }

    cout << "All "<< item_count<<" "<< "items are added to containers in the zones" << endl;
    return 0;
}
