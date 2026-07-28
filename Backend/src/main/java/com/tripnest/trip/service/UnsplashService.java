package com.tripnest.trip.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UnsplashService {

    @Value("${apis.unsplash.key:}")
    private String unsplashApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getDestinationImageUrl(String destinationName) {
        if (unsplashApiKey == null || unsplashApiKey.trim().isEmpty()) {
            return getDefaultImageUrl();
        }

        try {
            String url = "https://api.unsplash.com/search/photos?query=" + destinationName + "&orientation=landscape&per_page=1&client_id=" + unsplashApiKey;
            
            String responseString = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(responseString);
            
            JsonNode results = root.path("results");
            if (results.isArray() && results.size() > 0) {
                return results.get(0).path("urls").path("regular").asText();
            }
            
            return getDefaultImageUrl();
        } catch (Exception e) {
            System.err.println("Failed to fetch image from Unsplash: " + e.getMessage());
            return getDefaultImageUrl();
        }
    }
    
    private String getDefaultImageUrl() {
        return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop";
    }
}
