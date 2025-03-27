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
    // int rowNo;
    long volume;
    long unusedVolume;
    int rowHeight;
    vector<int> rowHeights;
    int rowWidth;
    vector<int> rowWidths;
    int rowDepth;
    vector<int> rowDepths;
    vector<string> itemIds;
};

unordered_map<int, rowInContainers> rows;
unordered_map<int, Item> items;

//volume = w*D*H
//unused_volume = volume - item_ids volume
//check - height <= rowHeight, width <= rowWidth, depth <= rowDepth, new_volume <= unused volume
//after inserting the volumes and unused volumes as well as the rowDepths, rowHeights, and rowWidths

void insertItem(Item item, unordered_map<int, rowInContainers> rows){
    if(rows.empty()){
        int h = get<0>(item.dimensions);
        int w = get<1>(item.dimensions);
        int d = get<2>(item.dimensions);
        long volume = h*w*d;
        rowCount++;
        rowInContainers newRow = {volume, 0, h, {h}, w, {w}, d, {d}, {item.name}};
        rows[rowCount] = newRow;
    }else{
        int h = get<0>(item.dimensions);
        int w = get<1>(item.dimensions);
        int d = get<2>(item.dimensions);

        for(auto & row : rows){
            rowCount++;
            if(row.second.unusedVolume > 0){
                bool heightAvailable = false;
                for(auto& rowH : row.second.rowHeights){
                    if(h <= rowH){
                        heightAvailable = true;
                        break;
                    }
                }
                bool widthAvailable = false;
                for(auto& rowW : row.second.rowWidths){
                    if(w <= rowW){
                        widthAvailable = true;
                        break;
                    }
                }
                bool depthAvailable = false;
                for(auto& rowD : row.second.rowDepths){
                    if(d <= rowD){
                        depthAvailable = true;
                        break;
                    }
                }

                if(heightAvailable && widthAvailable && depthAvailable){
                    long volume = h*w*d;
                    long unusedVolume = row.second.volume - volume;
                    if(unusedVolume >= 0){
                        row.second.itemIds.push_back(item.name);
                        row.second.volume = row.second.volume - volume;
                        row.second.unusedVolume = unusedVolume;
                        row.second.rowHeights.push_back(row.second.rowHeight - h);
                        row.second.rowWidths.push_back(row.second.rowWidth - w);
                        row.second.rowDepths.push_back(row.second.rowDepth - d);
                        break;
                    }
                }
            }
            cout<<"New row created"<<endl;
            rowCount++;
            rowInContainers newRow = {w*h*d, 0, h, {h}, w, {w}, d, {d}, {item.name}};
            rows[rowCount] = newRow;
        }
    }
}

int main(){

}


//this are wrong in these
// ❌ Core Algorithm Flaws
// 1. Volume-Based Approach vs Spatial Packing

// cpp
// // Current method (flawed)
// row.second.volume -= h*w*d;
// row.second.unusedVolume = row.second.volume;
// Problem: You're treating container space as liquid rather than 3D regions.
// Example:

// Container: 4x4x4 (64 units³)

// Insert 3x3x3 item (27 units³)

// Unused volume becomes 37 units³

// Next 2x2x4 item (16 units³) should fit by volume

// But spatially impossible - original item occupies physical space

// 2. Dimension List Management

// cpp
// // Current dimension tracking
// row.second.rowHeights.push_back(row.second.rowHeight - h);
// Flaw: Creates separate dimension entries instead of tracking contiguous spaces
// Fail Case:

// Container: 5x5x5

// Insert 3x3x3 item → Height list becomes [5, Next 2x2x2 item would incorrectly use 2-height entry

// Reality: Physical space is L-shaped, not two separate columns

// 3. Parameter Persistence Issue

// cpp
// void insertItem(Item item, unordered_map<int, rowInContainers> rows)
// Critical Bug: rows parameter passed by value → All modifications are lost after function cal

//so need to spatially d the thgins, which i'll do as a sep file