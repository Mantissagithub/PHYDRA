#include "json.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <tuple>
#include <unordered_map>
#include <climits>

using namespace std;
using nlohmann::json;
struct Zone {
    tuple<int, int, int> dimensions;
    vector<string> containers_id;
    int count;
    bool temp_zone;
    string temp_container_id;
};

unordered_map<string, Zone> zones;

int main(){
    cout<<"Implementing count implementation..."<<endl;

    string json_data = R"(
        [
            {"Item ID": "001", "Preferred Zone": "Crew Quarters"},
            {"Item ID": "002", "Preferred Zone": "Airlock"},
            {"Item ID": "003", "Preferred Zone": "Medical Bay"},
            {"Item ID": "004", "Preferred Zone": "Crew Quarters"}
    ])";

    json items = json::parse(json_data);

    for (auto& item : items) {
        string zoneId = item["Preferred Zone"];
        zones[zoneId].count++;
    }

    for(auto& zone : zones){
        cout<<zone.first<<" : "<<zone.second.count<<endl;
    }
    return 0;
}