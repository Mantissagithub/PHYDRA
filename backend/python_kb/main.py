zone = {
    0: {
        "container_id": str,
        "zone": str,
        "height": float,
        "width": float,
        "depth": float,
        "items": {
            {
                "itemId": str,
                "name": str,
                "width": int,
                "depth": int,
                "height": int,
                "priority": int,
                "expiryDate": str,
                "usageLimit": int,
                "preferredZone": str,
            }
        },
    }
}
Zone = {
    "dimensions": [int, int, int],
    "containers_id": [],
    "count": int,
    "temp_zone": False,
    "temp_container_id": str,
}
