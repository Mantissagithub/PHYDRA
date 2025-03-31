#include <ctime>
#include <iostream>
#include <stdio.h>
#include <string>
#include <vector>
#include <tuple>
#include <unordered_map>
#include <cstdio>

using namespace std;

struct Item {
    string name;
    tuple<int, int, int> dimensions;
    int priority;
    string expiry_date;
    int usage_limit;
    string preferred_zone;
    string kept_zone;
};

unordered_map<int, Item> items;
unordered_map<int, Item> wasteItems;

void simulateDays(int days, char* formattedDate, unordered_map<int, Item>& items){
    struct tm currentDate = {};
    sscanf(formattedDate, "%d-%d-%d", &currentDate.tm_year, &currentDate.tm_mon, &currentDate.tm_mday);
    
    currentDate.tm_year -= 1900; 
    currentDate.tm_mon -= 1;  
    
    for(int i=0; i<days; i++){
        strftime(formattedDate, 11, "%Y-%m-%d", &currentDate);
        cout<<"Simulating day: "<< i+1 << " with date: " << formattedDate << endl;

        for(auto it = items.begin(); it != items.end();){
            if(it->second.expiry_date == formattedDate){
                cout<<"Item " << it->second.name << " expired on " << formattedDate << endl;
                wasteItems[it->first] = it->second;
                it = items.erase(it);
            }else{
                ++it;
            }
        }
        
        currentDate.tm_mday++;
        mktime(&currentDate);  
    }
}

int main(){
    time_t timestamp;
    time(&timestamp);

    struct tm* info = localtime(&timestamp);

    char formattedDate[11];
    strftime(formattedDate, 11, "%Y-%m-%d", info);

    cout << "Today's date: " << formattedDate << endl;

    // Example items
    items[1] = {"Item1", make_tuple(2, 2, 2), 1, "2025-03-27", 10, "ZoneA", "ZoneB"};
    items[2] = {"Item2", make_tuple(3, 3, 3), 2, "2025-03-28", 5, "ZoneA", "ZoneB"};
    items[3] = {"Item3", make_tuple(2, 2, 2), 3, "2025-04-02", 5, "ZoneA", "ZoneB"};

    cout << "Starting simulation..." << endl;
    simulateDays(8, formattedDate, items);

    cout << "Simulation complete. Waste items:" << endl;
    for (const auto& [id, item] : wasteItems) {
        cout << "  ID: " << id << ", Name: " << item.name << ", Expiry Date: " << item.expiry_date << endl;
    }

    return 0;
}
