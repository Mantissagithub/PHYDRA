from hmac import new
from sys import stdin
from textwrap import indent
from fastapi import FastAPI,Request,Response, HTTPException
import json
from pydantic import BaseModel
# from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import List, Optional, final
import requests
import pandas as pd
import csv
from prisma import Prisma
from prisma.models import Item, Container as PrismaContainer, Zone, Placement
from datetime import datetime, date, timedelta

import subprocess
import re

prisma = Prisma()

app = FastAPI()

curr_date = date.today()

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

class Container(BaseModel):
    containerId: str
    zone: str
    width: float
    depth: float
    height: float
    items: List[str] = []

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
    # timestamp:str
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

containerState : List[Container] = []

# placements: List[dict] = []

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
async def placement(data: PlacementRequest):
    items = data.items
    containers = data.containers

    for i in items:
        i_data = {
            "itemId": i.itemId,
            "name": i.itemName,
            "width": int(i.itemWidth),
            "depth": int(i.itemDepth),
            "height": int(i.itemHeight),
            "priority": int(i.itemPriority),
            "expiryDate": i.itemExpiryDate,
            "usageLimit": int(i.itemUsageLimit),
            "preferredZone": i.itemPreferredZone,
        }

        try:
            created_item = await prisma.item.create(data=i_data)  # type: ignore
            print("Created Item")
        except Exception as e:
            print(f"Error creating item: {e}")

    input_data = json.dumps({
        "items": [
            {
                "itemId": item.itemId,
                "name": item.itemName,
                "width": item.itemWidth,
                "depth": item.itemDepth,
                "height": item.itemHeight,
                "priority": item.itemPriority,
                "expiryDate": item.itemExpiryDate,
                "usageLimit": item.itemUsageLimit,
                "preferredZone": item.itemPreferredZone
            } for item in items
        ]
    }, indent=4)

    command = "g++ -std=c++20 final_cpp_codes/priorityCalculationEngine.cpp -o final_cpp_codes/priorityCalculationEngine && ./final_cpp_codes/priorityCalculationEngine"
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    stdout, stderr = process.communicate(input=input_data)

    print("C++ Program Output:", stdout)
    print("C++ Program Errors:", stderr)

    output_data = json.loads(stdout)
    raw_items = output_data.get("items", [])

    new_items = []
    for item in raw_items:
        corrected_item = {
            "itemId": item.get("itemId", "").strip(),
            "name": item.get("name", "").strip(),
            "width": int(item.get("width", 0)),
            "depth": int(item.get("depth", 0)),
            "height": int(item.get("height", 0)),
            "priority": int(item.get("priority", 0)),
            "expiryDate": item.get("expiryDate", "").strip(),
            "usageLimit": int(item.get("usageLimit", 0)),
            "preferredZone": item.get("preferredZone", "").strip(),
            "priorityScore": float(item.get("priorityScore", 0.0))
        }
        new_items.append(corrected_item)

    for c in containers:
        c_data = {
            "containerId": c.containerId,
            "zone": c.zone,
            "width": float(c.width),
            "depth": float(c.depth),
            "height": float(c.height),
        }

        try:
            created_container = await prisma.container.create(data=c_data)  # type: ignore
            print("Created Container")
        except Exception as e:
            print(f"Error creating container: {e}")

    final_json = json.dumps({
        "items" : new_items,
        "containers": [c.dict() for c in containers]
    }, indent=4)

    command = "g++ -std=c++20 final_cpp_codes/3dBinPakckingAlgo.cpp -o final_cpp_codes/3dBinPakckingAlgo && ./final_cpp_codes/3dBinPakckingAlgo"
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    stdout, stderr = process.communicate(input=final_json)

    print("C++ Program Output:", stdout)
    print("C++ Program Errors:", stderr)

    stdout = stdout.strip()

    if not stdout:
        raise HTTPException(status_code=500, detail="C++ program did not return any output. Check for errors.")
    
    print("-"*50,stdout)
    # Clean the stdout string to make it valid JSON
    stdout = stdout.replace('\\n', '\n').replace('\\\"', '\"')

    # Remove any invalid escape sequences
    stdout = re.sub(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'', stdout)

    try:
        output_data = json.loads(stdout)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Problematic JSON: {stdout}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON response from algorithm: {str(e)}")
    output_data = json.loads(stdout)
    
    newContainerState = output_data.get("finalContainers", [])
    
    for x in newContainerState:
        items = []
        newContainer = Container(
            containerId = x.get("containerId", ""),
            zone=x.get("zone", ""),
            width=float(x.get("width", 0)),
            depth=float(x.get("depth", 0)),
            height=float(x.get("height", 0)),
            items = x.get("itemIds", [])
        )

        containerState.append(newContainer)

    placements = output_data.get("placements", [])

    print(f"placements: {placements}")

    for placement in placements:
        placement_data = {
            "containerId": placement["containerId"],
            "itemId": placement["itemId"],
            "startPos": json.dumps({
                "x": placement["startPos"][0],
                "y": placement["startPos"][1],
                "z": placement["startPos"][2],
            }),
            "endPos": json.dumps({
                "x": placement["endPos"][0],
                "y": placement["endPos"][1],
                "z": placement["endPos"][2],
            }),
        }
        try:
            created_placement = await prisma.placement.create(data=placement_data) # type: ignore
            print(f"Created Placement: {created_placement}")
        except Exception as e:
            print(f"Error creating placement: {e}")

    print(f"new container state: {containerState}")
    output_refined = {
        "placements" : output_data["placements"],
        "rearrangements" : output_data["rearrangements"]
    }

    return {"status": "success", "message" : output_refined}


@app.get("/api/search")
async def search(itemId: Optional[str] = None, itemName: Optional[str] = None, userId: Optional[str] = None):
    if not itemId and not itemName:
        raise HTTPException(status_code=400, detail="Either itemId or itemName must be provided")

    if itemId:
        item = await prisma.item.find_first(where={"itemId": itemId})
    elif itemName:
        item = await prisma.item.find_first(where={"name": itemName})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # i_data = {
    #     "itemId": item.itemId,
    #     "name": item.name,
    #     "width": item.width,
    #     "depth": item.depth,
    #     "height": item.height,
    #     "priority": item.priority,
    #     "expiryDate": item.expiryDate,
    #     "usageLimit": item.usageLimit,
    #     "preferredZone": item.preferredZone,
    #     "startPos": None,
    # }

    placements = await prisma.placement.find_first(where={"itemId": item.itemId})
    print(f"placements: {placements}")

    containerId = placements.containerId if placements else None

    placements1 = []
    # container = []
    item_ids = []
    item_start_pos_map = {}

    if placements:
        placements1 = await prisma.placement.find_many(where={"containerId": placements.containerId})
        for placement in placements1:
            item_ids.append(placement.itemId)
            item_start_pos_map[placement.itemId] = placement.startPos

        containerData = await prisma.container.find_first(where={"containerId": placements.containerId})
        if containerData:
            container = {
                "containerId" : containerData.containerId,
                "zone" : containerData.zone,
                "width" : containerData.width,
                "depth" : containerData.depth,
                "height" : containerData.height,
            }

    print(f"placements1: {placements1}")
    print(f"Container ID: {containerId}")
    print(f"Container: {container}")
    print(type(container))
    print(f"Item Start Position Map: {item_start_pos_map}")

    item_data = []

    # item = await prisma.item.find_first(where={"itemId": itemId})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for x in item_ids:
        item = await prisma.item.find_first(where={"itemId": x})
        if item:
            i = {
                "itemId": item.itemId,
                "name": item.name,
                "width": item.width,
                "depth": item.depth,
                "height": item.height,
                "startPos": item_start_pos_map[x],
            }
            item_data.append(i)
        else:
            print(f"Item with ID {x} not found in the database.")
    print(f"item data: {item_data}")

    if container:
        container_data = {
            "containerId": container.get("containerId", ""),
            "zone": container.get("zone", ""),
            "width": container.get("width", 0),
            "depth": container.get("depth", 0),
            "height": container.get("height", 0),
            "items": item_data
        }
    else:
        raise HTTPException(status_code=404, detail="Container not found")

    input_json = json.dumps({
        "container": container_data,
        "itemId": itemId
    }, indent=4)

    command = "g++ -std=c++20 final_cpp_codes/retrievalPathPlanning.cpp -o final_cpp_codes/retrievalPathPlanning && ./final_cpp_codes/retrievalPathPlanning"
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    stdout, stderr = process.communicate(input=input_json)

    print("C++ Program Output:", stdout)
    print("C++ Program Errors:", stderr)

    stdout = stdout.strip()

    if not stdout:
        raise HTTPException(status_code=500, detail="C++ program did not return any output. Check for errors.")

    print("-" * 50, stdout)
    stdout = stdout.replace('\\n', '\n').replace('\\\"', '\"')
    stdout = re.sub(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'', stdout)

    try:
        output_data = json.loads(stdout)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Problematic JSON: {stdout}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON response from algorithm: {str(e)}")

    return {"status": "success", "found": container, "item": item, "message": output_data}


@app.post("/api/retrieve")
#data:RetrieveRequest
# def retrieve():
#     command = "g++ -std=c++20 final_cpp_codes/retrievalPathPlanning.cpp -o final_cpp_codes/retrievalPathPlanning && ./final_cpp_codes/retrievalPathPlanning"
#     process = subprocess.Popen(command,stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
#     input_data = """3
# contA
# Crew Quarters
# 100 85 200
# 2
# 001
# Food Packet
# 10 15 20
# 10 10 20
# 002
# Oxygen Cylinder
# 20 25 30
# 15 15 50
# contB
# Airlock
# 50 85 200
# 1
# 003
# First Aid Kit
# 5 10 15
# 20 20 10
# contC
# Storage
# 120 100 250
# 3
# 004
# Water Container
# 30 40 50
# 25 25 40
# 005
# Tool Box
# 35 45 55
# 30 20 15
# 006
# Spare Parts
# 40 50 60
# 40 30 20
# """

    # stdout, stderr = process.communicate(input_data)
    # print(stdout,stderr)
    # return Response(stdout)

async def retrieve(data:RetrieveRequest):
    try:
        item_data = {
            "itemId":data.itemId,
            "userId": data.userId,
            # "timestamp": datetime.now().isoformat(),
        }

        item = await prisma.item.delete(where={"itemId": data.itemId})
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # await prisma.item.delete(where={"itemId": data.itemId})
        
        print(f"Item {data.itemId} retrieved by user {data.userId} at {datetime.now().isoformat()}")

        return {
            "status": "success",
            "message" : f"Item {data.itemId} retrieved by user {data.userId} at {datetime.now().isoformat()}",
            "item": item.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/place")
async def place(data:PlaceRequest):
#     {
# "itemId": "string",
# "userId": "string",
# "timestamp": "string", // ISO format
# "containerId": "string", // Where the item is kept
# "position": {
# "startCoordinates": {
# "width": number,
# "depth": number,
# "height": number
# },
# "endCoordinates": {
# "width": number,
# "depth": number,
# "height": number
# }
# }
# }
    itemId = data.itemId
    userId = data.userId
    timestamp1 = data.timestamp
    containerId = data.containerId
    startCoordinates = data.position.startCoordinates

    startCoo = {
        "x" : startCoordinates.width,
        "y" : startCoordinates.depth,
        "z" :startCoordinates.height
    }

    endCoordinates = data.position.endCoordinates

    endCoo = {
        "x" : endCoordinates.width,
        "y" : endCoordinates.depth,
        "z" : endCoordinates.height
    }

    item_to_retrieve = {
        "itemId" : itemId,
        "userId" : userId,
        "timeStamp" : timestamp1,
        "containerId" : containerId,
        "startCoordinates" : startCoo,
        "endCoordinates" : endCoo
    }

    # print(f"Item {itemId} placed by user {userId} at {timestamp} in container {containerId} from {startCoordinates} to {endCoordinates}")
    
    items = await prisma.item.find_many()
    containers = await prisma.container.find_many()
    placements = await prisma.placement.find_many()

    item_data = []

    for item in items:
        i_data = {
            "itemId" : item.itemId,
            "name" : item.name,
            "width" : item.width,
            "depth" : item.depth,
            "height" : item.height,
            "priority" : item.priority,
            "expiryDate" : item.expiryDate,
            "usageLimit" : item.usageLimit,
            "preferredZone" : item.preferredZone,
        }

        item_data.append(i_data)

    container_data = []

    for container in containers:
        c_data = {
            "containerId" : container.containerId,
            "zone" : container.zone,
            "width" : container.width,
            "depth" : container.depth,
            "height" : container.height
        }

        container_data.append(c_data)

    placement_data = []

    for placement in placements:
        p_data = {
            "containerId": placement.containerId,
            "itemId": placement.itemId,
            "startPos": {
                "x": placement.startPos["x"],
                "y": placement.startPos["y"],
                "z": placement.startPos["z"],
            },
            "endPos": {
                "x": placement.endPos["x"],
                "y": placement.endPos["y"],
                "z": placement.endPos["z"],
            },
        }

        placement_data.append(p_data)

    # print(f"Placement data : {placement_data}")

    input_json = json.dumps({
        "items": item_data,
        "containers": container_data,
        "placements": placement_data,
        "priorityItem" : item_to_retrieve
    }, indent=4)


    command = "g++ -std=c++20 final_cpp_codes/placingItem.cpp -o final_cpp_codes/placingItem && ./final_cpp_codes/placingItem"
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    stdout, stderr = process.communicate(input=input_json)

    print("C++ Program Output:", stdout)
    print("C++ Program Errors:", stderr)

@app.get("/api/waste/identify")
def waste_identify():
    pass

@app.post("/api/waste/return‐plan")
def waste_return_plan(data:WasteReturnPlanRequest):
    # data = json.load(str(data))
    with open("final_cpp_codes/ReturnPlan.json", "w") as f:
        content = json.dumps({
            "undockingContainerId": data.undockingContainerId,
            "undockingDate": data.undockingDate,
            "maxWeight": data.maxWeight
        }, indent=4)
        f.write(content)
        print("Success")
    command = "g++ -std=c++20 final_cpp_codes/wasteManagement.cpp -o final_cpp_codes/wasteManagement && ./final_cpp_codes/wasteManagement"
    process = subprocess.Popen(command,stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    input_data = """
3
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
    
    # return_plan_response = json.loads(stdout)
    print(stdout)
    # Extract JSON content after "Generating return plan..."
    try:
        json_start_index = stdout.find("Generating return plan...") + len("Generating return plan...")
        json_content = stdout[json_start_index:].strip()
        
        # Parse the extracted content as JSON
        return_plan_response = json.loads(json_content)
        return return_plan_response
    except Exception as e:
        print(f"Error parsing waste return plan: {e}")
        return Response(content=f"Error parsing waste return plan: {str(e)}", status_code=500)
    return Response(stdout)


@app.post("/api/waste/complete‐undocking")
def waste_complete_undocking(data:WasteCompleteUndocking):
    pass

@app.post("/api/simulate/day")
async def simulate_day(data: SimulateDayRequest):
    num_days = data.numOfDays
    target_date = None
    
    if data.toTimestamp:
        target_date = datetime.fromisoformat(data.toTimestamp.split('T')[0]).date()
        days_to_simulate = (target_date - curr_date).days
        if days_to_simulate < 0:
            raise HTTPException(status_code=400, detail="Target date must be in the future")
    elif num_days:
        days_to_simulate = num_days
        target_date = curr_date + timedelta(days=days_to_simulate)
    else:
        raise HTTPException(status_code=400, detail="Either numOfDays or toTimestamp must be provided")
    
    items_to_use = data.itemsToBeUsedPerDay
    
    id_map = {item.itemId: item for item in items_to_use if item.itemId}
    name_map = {item.name: item for item in items_to_use if item.name}
    
    all_items = await prisma.item.find_many()
    
    items_expired = []
    items_depleted_today = []
    items_used = []
    
    for item in all_items:
        if item.expiryDate and item.expiryDate != "N/A":
            expiry_date = datetime.strptime(item.expiryDate, "%Y-%m-%d").date()
            if expiry_date <= target_date:
                items_expired.append({
                    "itemId": item.itemId,
                    "name": item.name
                })
        
        if item.itemId in id_map or item.name in name_map:
            remaining_usage = item.usageLimit - days_to_simulate
            items_used.append({
                "itemId": item.itemId,
                "name": item.name,
                "remainingUses": max(0, remaining_usage)
            })
            
            if item.usageLimit > 0 and remaining_usage <= 0:
                items_depleted_today.append({
                    "itemId": item.itemId,
                    "name": item.name
                })
    
    return {
        "success": True,
        "newDate": target_date.isoformat(),
        "changes": {
            "itemsUsed": items_used,
            "itemsExpired": items_expired,
            "itemsDepletedToday": items_depleted_today
        }
    }


@app.post("/api/import/items")
async def import_items(data : PlacementItem):
    print(data)
    try:
        item_data = {
            "itemId": data.itemId,
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