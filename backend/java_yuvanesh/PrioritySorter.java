import java.util.*;

public class PrioritySorter {

    public static List<List<Object>> sortByScore(List<List<Object>> dataWithScores) {
        PriorityQueue<List<Object>> maxHeap = new PriorityQueue<>(
            (a, b) -> Double.compare((double) b.get(1), (double) a.get(1))
        );
        maxHeap.addAll(dataWithScores);
        List<List<Object>> sortedDataOnly = new ArrayList<>();
        while (!maxHeap.isEmpty()) {
            List<Object> entry = maxHeap.poll();      
            List<Object> data = (List<Object>) entry.get(0); 
            sortedDataOnly.add(data);
        }

        return sortedDataOnly;
    }
}