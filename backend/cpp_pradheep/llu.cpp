#include <iostream>
#include <string>
#include <vector>
#include <tuple>
#include <unordered_map>
#include <climits>

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

unordered_map<string, Zone> zones;
unordered_map<string, Container> containers;
unordered_map<string, string> items;  // (key: "zone+container+item", value: item name)

void llu_unit() {
    int minCount = INT_MAX;
    string minZoneId = "";
    
    for (auto& zone : zones) {
        string zoneId = zone.first;
        if (zone.second.count < minCount) {
            string tempContId = zone.second.temp_container_id;
            if (containers[tempContId].remaining_capacity == 0) continue;

            minCount = zone.second.count;
            minZoneId = zoneId;
        }
    }

    if (!minZoneId.empty()) {
        zones[minZoneId].temp_zone = true;
        cout << "Temporary Zone Assigned: " << minZoneId << endl;
    } else {
        cout << "No available temporary zones!" << endl;
    }
}



int main() {
    cout << "Implementing LLU Unit..." << endl;
    
    zones["01"] = {make_tuple(100, 100, 100), {"contA1", "contA2", "contA3"}, 5, false, "contA1"};
    zones["02"] = {make_tuple(200, 200, 200), {"contB1", "contB2"}, 3, false, "contB1"};
    
    containers["contA1"] = {50, 100, true, make_tuple(50, 50, 50), {}};
    containers["contA2"] = {30, 100, true, make_tuple(40, 40, 40), {}};
    containers["contA3"] = {20, 100, true, make_tuple(30, 30, 30), {}};
    containers["contB1"] = {0, 100, true, make_tuple(60, 60, 60), {}};
    containers["contB2"] = {75, 100, true, make_tuple(70, 70, 70), {}};
    
    llu_unit();

    return 0;
}
