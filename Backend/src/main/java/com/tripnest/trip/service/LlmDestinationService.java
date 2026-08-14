package com.tripnest.trip.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LlmDestinationService {

    @Value("${apis.gemini.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LlmDestinationData getDestinationData(String destinationName) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return new LlmDestinationData("", "", "");
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;
            
            String prompt = "You are a travel assistant. Provide details for the destination: '" + destinationName + "'. " +
                    "Return ONLY a raw JSON object (no markdown, no backticks) with exactly these 3 string keys: " +
                    "'country' (the country this is in), " +
                    "'description' (a 2-sentence engaging travel description), " +
                    "'attractions' (a comma-separated list of the top 3-5 attractions).";

            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String responseString = restTemplate.postForObject(url, request, String.class);
            JsonNode root = objectMapper.readTree(responseString);
            
            String textResponse = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
                    
            // Sometimes the LLM includes markdown ```json block despite instructions
            textResponse = textResponse.replace("```json", "").replace("```", "").trim();

            JsonNode dataNode = objectMapper.readTree(textResponse);
            
            return new LlmDestinationData(
                    dataNode.path("country").asText(""),
                    dataNode.path("description").asText(""),
                    dataNode.path("attractions").asText("")
            );

        } catch (Exception e) {
            System.err.println("Failed to fetch destination data from LLM: " + e.getMessage());
            return new LlmDestinationData("", "", "");
        }
    }

    public static class LlmDestinationData {
        public final String country;
        public final String description;
        public final String attractions;

        public LlmDestinationData(String country, String description, String attractions) {
            this.country = country;
            this.description = description;
            this.attractions = attractions;
        }
    }
}
