package com.tripnest.trip.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class UnsplashService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getDestinationImageUrl(String destinationName) {
        if (destinationName == null || destinationName.trim().isEmpty()) {
            return getDefaultImageUrl();
        }

        try {
            String cleanName = destinationName.replaceAll("[,.!?]+$", "").trim();
            if (!cleanName.isEmpty()) {
                cleanName = cleanName.substring(0, 1).toUpperCase() + cleanName.substring(1);
            }
            String query = URLEncoder.encode(cleanName, StandardCharsets.UTF_8.toString());
            String url = "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=" + query;
            
            String responseString = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(responseString);
            
            JsonNode pages = root.path("query").path("pages");
            if (pages.isObject() && pages.elements().hasNext()) {
                JsonNode page = pages.elements().next();
                if (page.has("original")) {
                    return page.path("original").path("source").asText();
                }
            }
            
            return getDefaultImageUrl();
        } catch (Exception e) {
            System.err.println("Failed to fetch image from Wikipedia: " + e.getMessage());
            return getDefaultImageUrl();
        }
    }
    
    private String getDefaultImageUrl() {
        return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop";
    }
}
