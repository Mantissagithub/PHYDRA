from hmac import new
from os import times
from sys import stdin
from textwrap import indent
from fastapi import FastAPI,Request,Response, HTTPException, UploadFile
import json
from py import log
from pydantic import BaseModel
# from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import List, Optional, Type
import requests
import pandas as pd
import csv
from prisma import Prisma
from prisma.models import Item, Container as PrismaContainer, Zone, Placement, Log
from datetime import datetime, date, timedelta

import subprocess
import re

from sympy import content
from tomlkit import item
from fastapi.responses import FileResponse

prisma = Prisma()

app = FastAPI()

curr_date_iso_format = date.today().isoformat()
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
    itemMass: float
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

containerState : List[Container] = []

# placements: List[dict] = []

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
            "mass":float(i.itemMass),
            "priority": int(i.itemPriority),
            "expiryDate": i.itemExpiryDate,
            "usageLimit": int(i.itemUsageLimit),
            "preferredZone": i.itemPreferredZone
        }

        try:
            existing_item = await prisma.item.find_first(where={"itemId": i.itemId})  # type: ignore
            if not existing_item:
                created_item = await prisma.item.create(data=i_data)  # type: ignore
                print("Created Item")
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
                "expiryDate": "N/A" if item.itemExpiryDate is None else item.itemExpiryDate,
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
            existing_container = await prisma.container.find_first(where={"containerId": c.containerId})  # type: ignore
            if not existing_container:
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
async def retrieve(data: RetrieveRequest):
    try:
        item_data = {
            "itemId": data.itemId,
            "userId": data.userId,
            "timestamp": data.timestamp
        }

        placements = item.placement.find_first(where={"itemId": data.itemId})
        print(f"placements: {placements}")

        containerId = placements.containerId if placements else None

        itemThing = await prisma.item.find_first(where={"itemId": data.itemId})
        print(f"itemThing: {itemThing}")
        if not itemThing:
            raise HTTPException(status_code=404, detail="Item not found")

        if curr_date_iso_format == item_data["timestamp"]:
            print(f"Item {data.itemId} retrieved by user {data.userId} at {datetime.now().isoformat()}")
            if itemThing.usageLimit is not None and itemThing.usageLimit > 0:
                updated_item = await prisma.item.update(
                    where={"itemId": data.itemId},
                    data={
                        "usageLimit": itemThing.usageLimit - 1
                    }
                )
                if updated_item:
                    print(f"Updated usageLimit for item {data.itemId}: {updated_item.usageLimit}")
                else:
                    print(f"Failed to update usageLimit for item {data.itemId}")
                # itemThing.usageLimit -= 1

        print(f"Item {data.itemId} retrieved by user {data.userId} at {datetime.now().isoformat()}")
        print(f"Item usage limit: {itemThing.usageLimit}")

        itemData = {
            "itemId": itemThing.itemId,
            "name": itemThing.name,
            "width": itemThing.width,
            "depth": itemThing.depth,
            "height": itemThing.height,
            "priority": itemThing.priority,
            "expiryDate": itemThing.expiryDate,
            "usageLimit": itemThing.usageLimit,
            "preferredZone": itemThing.preferredZone
        }

        log_data = {
            "userId": data.userId,
            "actionType" : "retrieve",
            "itemId": data.itemId,
            "details" : {
                "fromContainer" : containerId,
                "toContainer" : None,
                "reason" : "Item retrieved"
            }
        }

        xm = await prisma.log.create(data=log_data) #type: ignore
        print(f"Log created: {xm}")

        if not xm:
            raise HTTPException(status_code=500, detail="Log creation failed")

        return {
            "status": "success",
            "message": f"Item {data.itemId} retrieved by user {data.userId} at {datetime.now().isoformat()} and updated the usage limit",
            "item": itemData
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

    print(input_json)
    command = "g++ -std=c++20 final_cpp_codes/placingItem.cpp -o final_cpp_codes/placingItem && ./final_cpp_codes/placingItem"
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    stdout, stderr = process.communicate(input=input_json)

    print("C++ Program Output:", stdout)
    print("C++ Program Errors:", stderr)

    log_data = {
        "timestamp": datetime.now().isoformat(),
        "userId" : data.userId,
        "actionType" : "placed",
        "itemId" : data.itemId,
        "details" : {
            "fromContainer" : None,
            "toContainer" : data.containerId,
            "reason" : "Item placed in container"
        }
    }

    xm = await prisma.log.create(data=log_data) #type: ignore
    print(f"Log created: {xm}")
    
    if not xm:
        raise HTTPException(status_code=500, detail="Log creation failed")

    return {
        "status": "success",
        "message": f"Item {data.itemId} placed by user {data.userId} at {data.timestamp} in container {data.containerId} from {data.position.startCoordinates} to {data.position.endCoordinates}",
        "item": item_to_retrieve
    }

@app.get("/api/waste/identify")
async def waste_identify():
    items = await prisma.item.find_many()
    placements = await prisma.placement.find_many()

    waste_items_data = []
    curr_date = date.today()

    for item in items:
        expire = False
        reason = None
        if(item.expiryDate and item.expiryDate != "N/A"):
            expiry_date = datetime.strptime(item.expiryDate, "%Y-%m-%d").date()
            if expiry_date <= curr_date:
                # items_data.append(item)
                expire = True
                print(f"Item {item.itemId} has expired on {expiry_date}")
                reason = "Expired"
        elif(item.usageLimit and item.usageLimit != 0):
            if item.usageLimit <= 0:
                # items_data.append(item)
                expire = True
                print(f"Item {item.itemId} has usage limit reached")
                reason = "Out of uses"

        if expire:
            placements = await prisma.placement.find_first(where={"itemId": item.itemId})
            if placements:
                thing = {
                    "itemId": item.itemId,
                    "name": item.name,
                    "reason" : reason,
                    "containerId" : placements.containerId,
                    "positions" : {
                        "startPos": {
                            "width": placements.startPos["x"],
                            "depth": placements.startPos["y"],
                            "height": placements.startPos["z"],
                        },
                        "endPos": {
                            "width": placements.endPos["x"],
                            "depth": placements.endPos["y"],
                            "height": placements.endPos["z"],
                        }
                    }
                }

                waste_items_data.append(thing)

                log_data = {
                    "timestamp": datetime.now().isoformat(),
                    "userId" : "system",
                    "actionType" : "waste identified",
                    "itemId" : item.itemId,
                    "details" : {
                        "fromContainer" : placements.containerId,
                        "toContainer" : None,
                        "reason" : reason
                    }
                }

                xm = await prisma.log.create(data=log_data) #type: ignore
                print(f"Log created: {xm}")

                if not xm:
                    raise HTTPException(status_code=500, detail="Log creation failed")
    
    

    return {
        "status": "success",
        "wasteItems": waste_items_data}

@app.post("/api/waste/return‐plan")
async def waste_return_plan(data: WasteReturnPlanRequest):
    container_id = data.undockingContainerId
    undocking_date = data.undockingDate
    max_weight = data.maxWeight
    container = await prisma.container.find_first(where={"containerId": container_id})
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")

    zone = await prisma.zone.find_first(where={"name": container.zone})
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    containers = await prisma.container.find_many(where={"zone": zone.name})
    if not containers:
        raise HTTPException(status_code=404, detail="Containers not found")

    placements = await prisma.placement.find_many(where={"containerId": container_id})
    if not placements:
        raise HTTPException(status_code=404, detail="Placements not found")
    item_ids = [placement.itemId for placement in placements]

    items = []
    for item_id in item_ids:
        item = await prisma.item.find_first(where={"itemId": item_id})
        if item:
            i_data = {
                "itemId": item.itemId,
                "name": item.name,
                "width": item.width,
                "depth": item.depth,
                "height": item.height,
                "mass": item.mass,
                "priority": item.priority,
                "expiryDate": item.expiryDate,
                "usageLimit": item.usageLimit,
                "preferredZone": item.preferredZone
            }
            items.append(i_data)

    items_to_remove = []
    total_removed_weight = 0.0

    items.sort(key=lambda x: x["priority"], reverse=True)
    print(f"Items: {items}")

    for item in items:
        if total_removed_weight + item["mass"] <= max_weight:
            items_to_remove.append(item)
            total_removed_weight += item["mass"]
        else:
            break

    for item in items_to_remove:
        placement = await prisma.placement.find_first(where={"itemId": item["itemId"]})
        if placement:
            await prisma.placement.delete(where={"id": placement.id})
        await prisma.item.delete(where={"itemId": item["itemId"]})

        # Add log entry for the removed item
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "userId": "system",  # Assuming the system is performing the operation
            "actionType": "return-plan",
            "itemId": item["itemId"],
            "details": {
                "fromContainer": container_id,
                "toContainer": None,
                "reason": "Item removed as part of return plan"
            }
        }
        try:
            created_log = await prisma.log.create(data=log_data)  # type: ignore
            print(f"Log created: {created_log}")
        except Exception as e:
            print(f"Error creating log: {e}")

    remaining_items = [item for item in items if item not in items_to_remove]
    container_data = [
        {
            "containerId": c.containerId,
            "zone": c.zone,
            "width": c.width,
            "depth": c.depth,
            "height": c.height
        }
        for c in containers if c.containerId != container_id 
    ]

    input_json = json.dumps({
        "items": remaining_items,
        "containers": container_data
    }, indent=4)
    print("*", input_json)
    command = "g++ -std=c++20 final_cpp_codes/3dBinPakckingAlgo.cpp -o final_cpp_codes/3dBinPakckingAlgo && ./final_cpp_codes/3dBinPakckingAlgo"
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    stdout, stderr = process.communicate(input=input_json)

    print("3d algo C++ Program Output:", stdout)
    print("3d algo C++ Program Errors:", stderr)

    if not stdout:
        raise HTTPException(status_code=500, detail="C++ program did not return any output. Check for errors.")

    try:
        output_data = json.loads(stdout)
        print(type(output_data))
        print(f"Output data: {output_data}")
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Problematic JSON: {stdout}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON response from algorithm: {str(e)}")

    retrieval_steps = []
    items_to_remove_with_coordinates = []
    for item in items_to_remove:
        placement = await prisma.placement.find_first(where={"itemId": item["itemId"]})
        if placement:
            x_data = {
                "itemId": item["itemId"],
                "name": item["name"],
                "startPos": {
                    "x": placement.startPos["x"],
                    "y": placement.startPos["y"],
                    "z": placement.startPos["z"]
                },
                "width": item["width"],
                "depth": item["depth"],
                "height": item["height"],
            }

            items_to_remove_with_coordinates.append(x_data)
    print(f"Items to remove: {items_to_remove_with_coordinates}")
    for item in items_to_remove_with_coordinates:
        input_json = json.dumps({
            "container": {
                "containerId": container.containerId,
                "zone": container.zone,
                "width": container.width,
                "depth": container.depth,
                "height": container.height,
                "items": items
            },
            "itemId": item["itemId"]
        }, indent=4)

        print("*" * 50, "\nInput JSON:", input_json)

        command = "g++ -std=c++20 final_cpp_codes/retrievalPathPlanning.cpp -o final_cpp_codes/retrievalPathPlanning && ./final_cpp_codes/retrievalPathPlanning"
        process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
        stdout, stderr = process.communicate(input=input_json)

        print("retrieval C++ Retrieval Output:", stdout)
        print("retrieval C++ Retrieval Errors:", stderr)

        if not stdout:
            raise HTTPException(status_code=500, detail="C++ retrieval program did not return any output. Check for errors.")

        stdout = stdout.strip()

        print("-" * 50, stdout)
        stdout = stdout.replace('\\n', '\n').replace('\\\"', '\"')
        stdout = re.sub(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'', stdout)

        try:
            output_data = json.loads(stdout)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Problematic JSON: {stdout}")
            raise HTTPException(status_code=500, detail=f"Invalid JSON response from algorithm: {str(e)}")
        
        retrieval_steps.append(output_data)
        
    return_items = [
        {
            "itemId": item["itemId"],
            "name": item["name"],
            "reason": "Undocking"
        }
        for item in items_to_remove_with_coordinates
    ]

    total_volume = sum(item["width"] * item["depth"] * item["height"] for item in items_to_remove_with_coordinates)
    total_weight = sum(item["mass"] for item in items_to_remove_with_coordinates if item["mass"])

    return_manifest = {
        "undockingContainerId": container_id,
        "undockingDate": undocking_date,
        "returnItems": return_items,
        "totalVolume": total_volume,
        "totalWeight": total_weight
    }

    return {
        "success": True,
        "returnPlan": output_data.get("placements", []),
        "retrievalSteps": retrieval_steps,
        "returnManifest": return_manifest
    }

@app.post("/api/waste/complete‐undocking")
async def waste_complete_undocking(data:WasteCompleteUndocking):
    undockingContainerId = data.undockingContainerId
    timestamp = data.timestamp

    placements = await prisma.placement.find_many(where={"containerId": undockingContainerId})

    item_ids = []

    for placement in placements:
        item_ids.append(placement.itemId)
        if(timestamp == date.today()):
            await prisma.item.delete(where={"itemId": placement.itemId})
            print(f"Deleted item {placement.itemId}")
    
    await prisma.placement.delete_many(where={"containerId": undockingContainerId})
    print(f"Deleted placements for container {undockingContainerId}")

    return {
        "status": "success",
        "itemsRemoved" : len(item_ids)
    }


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
async def import_items(file:UploadFile):
# item_id,name,width_cm,depth_cm,height_cm,mass_kg,priority,expiry_date,usage_limit,preferred_zone
    count = 0
    with open("csv_data/input_items.csv", "r") as f:
        contents = await file.read()
        text_contents = contents.decode("utf-8").splitlines()
        reader = csv.reader(text_contents)
        header = next(reader)
        for row in reader:
            count+=1
            item_id = row[0]
            name = row[1]
            width = float(row[2]) if row[2] else None
            depth = float(row[3]) if row[3] else None
            height = float(row[4]) if row[4] else None
            mass = float(row[5]) if row[5] else None
            priority = int(row[6]) if row[6] else None
            expiry_date = row[7]
            usage_limit = int(row[8]) if row[8] else None
            preferred_zone = row[9]


            item_data = {
                "itemId": item_id,
                "name": name,
                "width": width,
                "depth": depth,
                "height": height,
                "mass": mass,
                "priority": priority,
                "expiryDate": expiry_date,
                "usageLimit": usage_limit,
                "preferredZone": preferred_zone
            }

            existing_item = await prisma.item.find_first(where={"itemId": item_id})
            if existing_item:
                await prisma.item.update(where={"itemId": item_id}, data=item_data) # type: ignore
                print("Updated Item")
                continue
            try:
                created_item = await prisma.item.create(data=item_data) # type: ignore
                print("Created Item")
            except Exception as e:
                print(f"Error creating item: {e}")
    return Response(content=f"Success: {count} items imported", media_type="text/plain")

@app.post("/api/import/containers")
async def import_containers(file: UploadFile):
    zone_map = {}
    count = 0
    contents = await file.read()
    text_contents = contents.decode("utf-8").splitlines()
    reader = csv.reader(text_contents)
    header = next(reader)
    for row in reader:
            count+=1
            zone = row[0]
            container_id = row[1]
            width = float(row[2]) if row[2] else None
            depth = float(row[3]) if row[3] else None
            height = float(row[4]) if row[4] else None

            if zone not in zone_map:
                zone_map[zone] = []
            zone_map[zone].append(container_id)
            container_data = {
                "containerId": container_id,
                "zone": zone,
                "width": width,
                "depth": depth,
                "height": height
            }

            try:
                created_container = await prisma.container.create(data=container_data) #type: ignore
                print("Created Container")
            except Exception as e:
                print(f"Error creating container: {e}")

    print(f"Zone Map: {zone_map}")

    for zone_name, container_ids in zone_map.items():
        zone_data = {
            "name": zone_name,
            "containersIds": container_ids
        }

        try:
            created_zone = await prisma.zone.create(data=zone_data) #type: ignore
            print("Created Zone")
        except Exception as e:
            print(f"Error creating zone: {e}")
    
    return Response(json.dumps({"content": f"Success: {count} containers imported"}), media_type="application/json")


@app.get("/api/export/arrangement")
async def export_arrangement():
    placements = await prisma.placement.find_many()
    if not placements:
        raise HTTPException(status_code=404, detail="No placements found")

    file_path = "csv_data/placements.csv"
    with open(file_path, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["Item ID", "Container ID", "Coordinates (W1,D1,H1)", "Coordinates (W2,D2,H2)"])
        for p in placements:
            writer.writerow([
                p.itemId,
                p.containerId,
                f"({p.startPos['x']},{p.startPos['y']},{p.startPos['z']})",
                f"({p.endPos['x']},{p.endPos['y']},{p.endPos['z']})"
            ])

    return FileResponse(file_path, media_type="text/csv", filename="/csv_data/placements.csv")

class LogWhereInput(BaseModel):
    createdAt: Optional[dict[str, datetime]] = None
    itemId: Optional[str] = None
    userId: Optional[str] = None
    actionType: Optional[str] = None

@app.get("/api/logs")
class LogsRequest(BaseModel):
    startDate: str
    endDate: str
    itemId: Optional[str] = None
    userId: Optional[str] = None
    actionType: Optional[str] = None

def logs(request: LogsRequest):
    start_date = datetime.fromisoformat(request.startDate)
    end_date = datetime.fromisoformat(request.endDate)
    item_id = request.itemId
    user_id = request.userId
    action_type = request.actionType

    where = LogWhereInput(
        createdAt={"gte": start_date, "lte": end_date} if start_date and end_date else None,
        itemId=item_id,
        userId=user_id,
        actionType=action_type
    )

    logs = prisma.log.find_many(where=where.dict(exclude_none=True)) #type: ignore
    return logs

class GetContainers(BaseModel):
    zoneName:str
class GetItems(BaseModel):
    containerId:str
    
@app.get("/api/get-zones")
async def get_zones():
    zones = await prisma.zone.find_many()
    
    print(zones)
    zone_names = []
    for zone in zones:
        zone_names.append(zone.name)
    return Response(json.dumps({"Response":"SUCCESS","zones":zone_names}))

@app.get("/api/get-items")
async def get_items(data:GetItems):
    container_id = data.containerId
    
    print(container_id)
    
    container_data = await prisma.container.find_many(where={"containerId":container_id})
    
    print(container_data)
    items_ids = []
    for container in container_data:
        if container.itemsIds:
            items_ids.extend(container.itemsIds)
    print(items_ids)
    items = []
    if items_ids:
        items = await prisma.item.find_many(where={"itemId": {"in": items_ids}})
    print(items)

    return Response(json.dumps({"Response":"Success","items":items}))

@app.get("/api/get-containers")
async def get_containers(data:GetContainers):
    zone_name = data.zoneName

    container_data = await prisma.container.find_many(where={"zone": zone_name})
    
    print(container_data)
    
    containers = []
    for container in container_data:
        containers.append(container.containerId)
    
    return Response(json.dumps({"Response":"Success","Containers":str(containers)}))
