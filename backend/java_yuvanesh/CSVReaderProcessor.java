import java.io.*;
import java.util.*;

public class CSVReaderProcessor {
    public static List<List<Object>> readAndProcessCSV(String filePath) {
        List<List<Object>> largeList = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            br.readLine(); 

            while ((line = br.readLine()) != null) {
                String[] values = line.split(",");

                if (values.length < 9) continue;
                String itemId = values[0].trim();
                String name = values[1].trim();
                String width = values[2].trim();
                String depth = values[3].trim();
                String height = values[4].trim();
                String mass = values[5].trim();
                String priority = values[6].trim();
                String expiryDate = values[7].trim();
                String usageLimit = values[8].trim();
                String preferredZone = values[9].trim();

                List<String> itemData = Arrays.asList(itemId, name, width, depth, height, mass, usageLimit, preferredZone);
                List<Object> entry = new ArrayList<>();
                entry.add(itemData);
                entry.add(Integer.parseInt(priority.equals("N/A") ? "0" : priority));
                entry.add(expiryDate);

                largeList.add(entry);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return largeList;
    }
}