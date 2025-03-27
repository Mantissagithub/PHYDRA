#include <stdio.h>
#include <iostream>
#include <string>
#include <vector>
#include <tuple>
#include <unordered_map>
#include <climits>

using namespace std;

int rowCount = 0;

struct Item {
    string name;
    tuple<int, int, int> dimensions;
    int priority;
    string expiry_date;
    int usage_limit;
    string preferred_zone;
    string kept_zone;
};

struct rowInContainers{
    long total_volume;
    long used_volume;
    vector<int> heightSlots;
    vector<int> widthSlots;
    vector<int> depthSlots;
    vector<string> itemIds;
};

unordered_map<int, rowInContainers> rows;
unordered_map<int, Item> items;

void insertItem(Item item, unordered_map<int, rowInContainers> rows){
    int h = get<0>(item.dimensions);
    int w = get<1>(item.dimensions);
    int d = get<2>(item.dimensions);

    long item_volume = h * w * d;

    cout << "Attempting to insert item: " << item.name 
         << " with dimensions (" << h << ", " << w << ", " << d << ") and volume " << item_volume << endl;

    for(auto& [row_id, row] : rows){
        cout << "Checking row " << row_id << " with available slots:" << endl;
        for(int i = 0; i < row.heightSlots.size(); i++){
            int avail_h = row.heightSlots[i];
            int avail_w = row.widthSlots[i];
            int avail_d = row.depthSlots[i];

            cout << "  Slot " << i << ": (" << avail_h << ", " << avail_w << ", " << avail_d << ")" << endl;

            if(h <= avail_h && w <= avail_w && d <= avail_d){
                cout << "  Found a suitable slot in row " << row_id << ", slot " << i << endl;

                row.used_volume += item_volume;
                row.itemIds.push_back(item.name);

                row.heightSlots.erase(row.heightSlots.begin() + i);
                row.widthSlots.erase(row.widthSlots.begin() + i);
                row.depthSlots.erase(row.depthSlots.begin() + i);

                if(avail_h > h){
                    row.heightSlots.push_back(avail_h - h);
                    row.widthSlots.push_back(avail_w);
                    row.depthSlots.push_back(avail_d);
                    cout << "  Updated slot: Remaining height " << avail_h - h << endl;
                }

                if(avail_w > w){
                    row.heightSlots.push_back(h);
                    row.widthSlots.push_back(avail_w - w);
                    row.depthSlots.push_back(avail_d);
                    cout << "  Updated slot: Remaining width " << avail_w - w << endl;
                }

                if(avail_d > d){
                    row.heightSlots.push_back(h);
                    row.widthSlots.push_back(w);
                    row.depthSlots.push_back(avail_d - d);
                    cout << "  Updated slot: Remaining depth " << avail_d - d << endl;
                }

                cout << "Item " << item.name << " successfully inserted into row " << row_id << endl;
                return;
            }
        }
    }

    cout << "No suitable slot found. Creating a new row for item " << item.name << endl;

    rowCount++;
    rows[rowCount] = rowInContainers{
        h * w * d,
        item_volume,
        {h}, 
        {w},
        {d}, 
        {item.name}
    };

    cout << "New row " << rowCount << " created with dimensions (" << h << ", " << w << ", " << d << ")" << endl;
}

int main(){
    // Example usage
    Item item1 = {"Item1", make_tuple(2, 2, 2), 1, "2025-12-31", 10, "ZoneA", "ZoneB"};
    Item item2 = {"Item2", make_tuple(3, 3, 3), 2, "2025-12-31", 5, "ZoneA", "ZoneB"};

    insertItem(item1, rows);
    insertItem(item2, rows);

    return 0;
}