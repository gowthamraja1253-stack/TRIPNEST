package com.tripnest.trip.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.trip.dto.WeatherResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OpenWeatherService {

    @Value("${apis.openweather.key:}")
    private String openWeatherApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WeatherResponse getWeather(String destinationName) {
        if (openWeatherApiKey == null || openWeatherApiKey.trim().isEmpty()) {
            return getFallbackWeather();
        }

        try {
            // First get coordinates (Geocoding API is better but we'll try direct weather API first)
            String url = "https://api.openweathermap.org/data/2.5/weather?q=" + destinationName + "&units=metric&appid=" + openWeatherApiKey;
            
            String responseString = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(responseString);
            
            JsonNode main = root.path("main");
            JsonNode weatherArray = root.path("weather");
            
            String condition = "Unknown";
            String description = "Unknown conditions";
            
            if (weatherArray.isArray() && weatherArray.size() > 0) {
                condition = weatherArray.get(0).path("main").asText();
                description = weatherArray.get(0).path("description").asText();
                // capitalize first letter of description
                if (description.length() > 0) {
                    description = description.substring(0, 1).toUpperCase() + description.substring(1);
                }
            }
            
            return WeatherResponse.builder()
                    .temperature(main.path("temp").asDouble())
                    .humidity(main.path("humidity").asInt())
                    .condition(condition)
                    .description(description)
                    .build();
                    
        } catch (Exception e) {
            System.err.println("Failed to fetch weather from OpenWeather: " + e.getMessage());
            return getFallbackWeather();
        }
    }
    
    private WeatherResponse getFallbackWeather() {
        return WeatherResponse.builder()
                .temperature(22.5)
                .humidity(45)
                .condition("Sunny")
                .description("Clear skies (Mock)")
                .build();
    }
}
