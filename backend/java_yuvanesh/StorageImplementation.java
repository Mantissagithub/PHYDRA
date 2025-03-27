import java.util.*;

class StorageSystem {
    private Map<String, List<List<Object>>> containers;  
    private Map<String, Integer> zoneReference; 
    private int containerCounter;
    private int positionCounter;  

    public StorageSystem() {
        this.containers = new HashMap<>();
        this.zoneReference = new HashMap<>();
        this.containerCounter = 1;
        this.positionCounter = 1;

        // intitalzing zone numbers
        zoneReference.put("Crew Quarters", 1);
        zoneReference.put("Airlock", 2);
        zoneReference.put("Medical Bay", 3);
        zoneReference.put("Laboratory", 4);
        zoneReference.put("Engineering bay", 5);
        zoneReference.put("waste management", 6);
    }

    // check if item can fit in the contianer 
    private boolean canFit(List<String> existingContainer, List<String> newItem) {
        int existingWidth = Integer.parseInt(existingContainer.get(2));
        int existingDepth = Integer.parseInt(existingContainer.get(3));
        int existingHeight = Integer.parseInt(existingContainer.get(4));

        int newWidth = Integer.parseInt(newItem.get(2));
        int newDepth = Integer.parseInt(newItem.get(3));
        int newHeight = Integer.parseInt(newItem.get(4));

        return newWidth <= existingWidth && newDepth <= existingDepth && newHeight <= existingHeight;
    }

    // Storing item
    public void storeItem(List<List<Object>> data, int priorityScore) {
        List<String> itemData = new ArrayList<>();
        for (Object obj : data.get(0)) {
        itemData.add(obj.toString()); 
        }

        String preferredZone = data.get(0).get(data.get(0).size() - 1).toString();
        int zoneNum = zoneReference.getOrDefault(preferredZone, 0); 

        // place in current containers
        String selectedContainerId = null;
        for (String containerId : containers.keySet()) {
            List<List<Object>> container = containers.get(containerId);
            if (!container.isEmpty() && canFit((List<String>) container.get(0).get(0), itemData)) {
                selectedContainerId = containerId;
                break;
            }
        }

        if (selectedContainerId == null) {
            selectedContainerId = "C" + containerCounter++;
            containers.put(selectedContainerId, new ArrayList<>());
        }

        //id generation
        String uniqueId = preferredZone+zoneNum + "-" + selectedContainerId + "-" + itemData.get(1) + "-" + positionCounter++;

        data.add(Collections.singletonList(priorityScore));


        List<Object> flattenedData = new ArrayList<>();
        flattenedData.addAll(data);
        containers.get(selectedContainerId).add(flattenedData);

    }

}