#include <ctime>
#include <iostream>
#include <stdio.h>
#include <string>
#include <vector>
#include <tuple>
#include <unordered_map>

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

int main(){
    time_t timestamp;
    time(&timestamp);

    // Display the date and time represented by the timestamp
    cout << ctime(&timestamp);
    return 0;
}