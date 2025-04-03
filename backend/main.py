from fastapi import FastAPI,Request,Response, HTTPException
import json
from pydantic import BaseModel
# from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import List, Optional
import requests
import pandas as pd
import csv
from prisma import Prisma
from prisma.models import Item, Container, Zone

import subprocess

prisma = Prisma()

app = FastAPI()


@app.get("/")
def welcome():
    return Response("Welcome")

@app.on_event("startup")
async def startup():
    await prisma.connect()
    print("Prisma connected....")

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()
    print("Prisma disconnected....")

class PlacementItem(BaseModel):
    itemId: str
    itemName: str
    itemWidth: float
    itemDepth: float
    itemHeight: float
    itemPriority: float
    itemExpiryDate: str
    itemUsageLimit: float
    itemPreferredZone: str

class PlacementContainer(BaseModel):
    containerId: str
    zone: str
    width: float
    depth: float
    height: float

class PlacementRequest(BaseModel):
    items: List[PlacementItem]
    containers: List[PlacementContainer]

class SearchRequest(BaseModel):
    itemId:str
    itemName:str
    userId:str

class RetrieveRequest(BaseModel):
    itemId:str
    userId:str
    timestamp:str
class Coordinates(BaseModel):
    width: float
    depth: float
    height: float

class Position(BaseModel):
    startCoordinates: Coordinates
    endCoordinates: Coordinates

class PlaceRequest(BaseModel):
    itemId: str
    userId: str
    timestamp: str 
    containerId: str 
    position: Position
    
class WasteReturnPlanRequest(BaseModel):
    undockingContainerId: str
    undockingDate: str  # ISO format
    maxWeight: float

class WasteCompleteUndocking(BaseModel):
    undockingContainerId: str
    timestamp: str  # ISO format
    
class SimulateItemUsage(BaseModel):
    itemId: str
    name: Optional[str] = None  # Making it optional since either itemId or name can be used

class SimulateDayRequest(BaseModel):
    numOfDays: Optional[int] = None  # Either this or toTimestamp
    toTimestamp: Optional[str] = None  # ISO format
    itemsToBeUsedPerDay: List[SimulateItemUsage]
    
    
class ContainerImportRequest(BaseModel):
    fileUrl: str

@app.post("/api/import/containers")
def import_containers(data: ContainerImportRequest):
    url = data.fileUrl
    print(url)
    # try:
    #     df = pd.read_csv(url, on_bad_lines='skip')
    #     df.to_csv("download.csv")
    #     return Response(content=f"Success: {len(df)} rows imported", media_type="text/plain")
    # except Exception as e:
    #     return Response(content=f"Error: {str(e)}", status_code=400, media_type="text/plain")
    container_data = pd.read_csv("username.csv")
    command = "g++ -std=c++20 final_cpp_codes/priorityCalculationEngine.cpp -o final_cpp_codes/priorityCalculationEngine && ./final_cpp_codes/priorityCalculationEngine"
    process = subprocess.Popen(command,stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    print("starting process")
    input_data = """10
I001
ItemA
10 20 30
5.5
80
2025-12-30
3
Zone1
consumables
I002
ItemB
15 25 35
4.2
60
2024-06-15
5
Zone2
equipment
I003
ItemC
20 30 40
6.0
90
N/A
2
Zone3
payload
I004
ItemD
12 18 24
3.8
70
2026-01-01
4
Zone1
consumables
I005
ItemE
14 22 28
4.5
50
2025-09-10
1
Zone2
equipment
I006
ItemF
16 24 32
5.0
85
2023-11-20
6
Zone3
payload
I007
ItemG
18 26 34
5.7
95
N/A
3
Zone1
consumables
I008
ItemH
11 19 27
3.2
40
2024-07-05
2
Zone2
equipment
I009
ItemI
13 21 29
4.8
75
2026-05-15
5
Zone3
payload
I010
ItemJ
17 23 31
6.2
88
2025-02-28
7
Zone1
consumables
"""
    stdout, stderr = process.communicate(input_data)
    print(stdout,stderr)
    return Response(stdout)
    

@app.post("/api/placement")
#data:PlacementRequest
def placement():
    command = "g++ -std=c++20 final_cpp_codes/3dBinPakckingAlgo.cpp -o final_cpp_codes/3dBinPakckingAlgo && ./final_cpp_codes/3dBinPakckingAlgo"
    process = subprocess.Popen(command,stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    input_data = """4
contA
Crew Quarters
100 85 200
contB
Airlock
50 85 200
contC
Medical Bay
80 70 150
contD
Storage
120 100 250
8
001
Food Packet
10 10 20
80
2025-05-20
30
Crew Quarters
002
Oxygen Cylinder
15 15 50
95
2025-12-31
100
Airlock
003
First Aid Kit
20 20 10
100
2025-07-10
5
Medical Bay
004
Water Container
25 25 40
90
2026-01-15
60
Crew Quarters
005
Tool Box
30 20 15
75
2027-03-22
200
Storage
006
Emergency Rations
15 15 25
85
2026-06-10
45
Crew Quarters
007
Medical Equipment
35 25 30
100
2025-09-30
10
Medical Bay
008
Spare Parts
40 30 20
70
2030-01-01
300
Storage
"""

    stdout, stderr = process.communicate(input_data)
    print(stdout,stderr)
    return Response(stdout)

@app.get("/api/search")
async def search(itemId: Optional[str] = None, itemName: Optional[str] = None, userId: Optional[str] = None):
    if not itemId and not itemName:
        raise HTTPException(status_code=400, detail="Either itemId or itemName must be provided")
    
    try:
        if itemId:
            item = await prisma.item.find_first(where={"itemId": itemId})
        elif itemName:
            item = await prisma.item.find_first(where={"name": itemName})
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        return {
            "status": "success",
            "item": item.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/retrieve")
#data:RetrieveRequest
def retrieve():
    command = "g++ -std=c++20 final_cpp_codes/retrievalPathPlanning.cpp -o final_cpp_codes/retrievalPathPlanning && ./final_cpp_codes/retrievalPathPlanning"
    process = subprocess.Popen(command,stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    input_data = """3
contA
Crew Quarters
100 85 200
2
001
Food Packet
10 15 20
10 10 20
002
Oxygen Cylinder
20 25 30
15 15 50
contB
Airlock
50 85 200
1
003
First Aid Kit
5 10 15
20 20 10
contC
Storage
120 100 250
3
004
Water Container
30 40 50
25 25 40
005
Tool Box
35 45 55
30 20 15
006
Spare Parts
40 50 60
40 30 20
"""

    stdout, stderr = process.communicate(input_data)
    print(stdout,stderr)
    return Response(stdout)


@app.post("/api/place")
def place(data:PlaceRequest):
    pass

@app.get("/api/waste/identify")
def waste_identify():
    pass

@app.post("/api/waste/return‐plan")
#data:WasteReturnPlanRequest
def waste_return_plan():
    print("innjjjj")
    command = "g++ -std=c++20 final_cpp_codes/wasteManagement.cpp -o final_cpp_codes/wasteManagement && ./final_cpp_codes/wasteManagement"
    process = subprocess.Popen(command,stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    input_data = """3
contA
Crew Quarters
100 85 200
contB
Storage
120 100 250
contC
Airlock
80 70 150
5
001
Expired Food Packet
10 10 20
2.5
30
2024-05-10
10
Crew Quarters
002
Damaged Oxygen Cylinder
15 15 50
10.0
50
N/A
5
Airlock
003
Broken First Aid Kit
20 20 10
1.2
20
2024-07-01
2
Storage
004
Used Battery Pack
25 25 15
3.5
40
N/A
15
Storage
005
Spoiled Water Container
30 20 25
5.0
35
2024-08-20
7
Crew Quarters
5
001
contA
5 10 15
002
contC
10 20 30
003
contB
15 25 35
004
contB
20 30 40
005
contA
25 35 45
"""

    stdout, stderr = process.communicate(input_data)
    print(stdout,stderr)
    return Response(stdout)

@app.post("/api/waste/complete‐undocking")
def waste_complete_undocking(data:WasteCompleteUndocking):
    pass

@app.post("/api/simulate/day")
def simulate_day(data:SimulateDayRequest):
    pass


@app.post("/api/import/items")
async def import_items(data : PlacementItem):
    print(data)
    try:
        item_data = {
            "itemId":data.itemId,
            "name": data.itemName,
            "width": int(data.itemWidth),
            "depth": int(data.itemDepth),
            "height": int(data.itemHeight),
            "priority": int(data.itemPriority),
            "expiryDate": data.itemExpiryDate,
            "usageLimit": int(data.itemUsageLimit),
            "preferredZone": data.itemPreferredZone,
        }


        created_item = await prisma.item.create(item_data) # type: ignore
        print("Created ITem")
        return{
            "status": "success",
            "item": created_item.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/export/arrangement")
def export_arrangement(data):
    pass


class LogsRequest(BaseModel):
    startDate: str  # ISO format
    endDate: str  # ISO format
    itemId: Optional[str] = None
    userId: Optional[str] = None
    actionType: Optional[str] = None  # "placement", "retrieval", "rearrangement", "disposal"

@app.get("/api/logs")
def logs(request: LogsRequest):
    pass
