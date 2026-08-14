package com.tripnest.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tripnest.ai.dto.AiChatRequest;
import com.tripnest.ai.dto.AiChatResponse;
import com.tripnest.trip.dto.TripResponse;
import com.tripnest.trip.dto.CreateTripRequest;
import com.tripnest.trip.service.TripService;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class AiChatService {

    @Value("${apis.gemini.key:}")
    private String geminiApiKey;

    private final TripService tripService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiChatService(TripService tripService) {
        this.tripService = tripService;
    }

    public AiChatResponse chat(AiChatRequest request, String username) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return new AiChatResponse("Sorry, the AI service is currently unconfigured. Please set the Gemini API key.");
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            // Fetch user trips for context
            List<TripResponse> userTrips = tripService.getUserTrips(username);
            
            // Build Context String
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("You are TripNest AI, an intelligent, friendly, and highly capable travel assistant built into the TripNest travel management platform.\n\n");
            contextBuilder.append("Guidelines:\n");
            contextBuilder.append("- Be helpful, concise, and professional.\n");
            contextBuilder.append("- Format your responses with markdown (bold, bullet points, numbered lists) for readability.\n");
            contextBuilder.append("- Focus on travel-related questions, planning, and recommendations.\n");
            contextBuilder.append("- Clearly distinguish suggestions from confirmed bookings. Never claim a booking was made unless explicitly verified.\n");
            contextBuilder.append("- Do not invent TripNest user data.\n");
            contextBuilder.append("- If the user asks you to create, add, or plan a trip, use the create_trip function to add it to their dashboard.\n\n");
            
            if (userTrips != null && !userTrips.isEmpty()) {
                contextBuilder.append("Current User's Existing Trips Context (DO NOT assume these are booked unless they say so, just use as context for recommendations):\n");
                for (TripResponse trip : userTrips) {
                    contextBuilder.append("- ").append(trip.getTitle())
                            .append(" in ").append(trip.getDestinationName())
                            .append(" (").append(trip.getDestinationCountry()).append("). ")
                            .append("Dates: ").append(trip.getStartDate()).append(" to ").append(trip.getEndDate())
                            .append(". Budget: ").append(trip.getBudget()).append(".\n");
                }
            } else {
                contextBuilder.append("The user currently has no trips planned in TripNest.\n");
            }

            ObjectNode requestBody = objectMapper.createObjectNode();

            // System Instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ArrayNode sysParts = objectMapper.createArrayNode();
            ObjectNode sysPart = objectMapper.createObjectNode();
            sysPart.put("text", contextBuilder.toString());
            sysParts.add(sysPart);
            systemInstruction.set("parts", sysParts);
            requestBody.set("systemInstruction", systemInstruction);

            // Contents Array (History + New Message)
            ArrayNode contentsArray = objectMapper.createArrayNode();
            
            if (request.getConversationHistory() != null) {
                for (AiChatRequest.ChatMessage msg : request.getConversationHistory()) {
                    ObjectNode contentNode = objectMapper.createObjectNode();
                    // Gemini uses "user" and "model"
                    contentNode.put("role", "ai".equalsIgnoreCase(msg.getRole()) || "model".equalsIgnoreCase(msg.getRole()) ? "model" : "user");
                    ArrayNode partsArray = objectMapper.createArrayNode();
                    ObjectNode textPart = objectMapper.createObjectNode();
                    textPart.put("text", msg.getContent());
                    partsArray.add(textPart);
                    contentNode.set("parts", partsArray);
                    contentsArray.add(contentNode);
                }
            }

            // Current User Message
            ObjectNode currentMsgNode = objectMapper.createObjectNode();
            currentMsgNode.put("role", "user");
            ArrayNode currPartsArray = objectMapper.createArrayNode();
            ObjectNode currTextPart = objectMapper.createObjectNode();
            currTextPart.put("text", request.getMessage());
            currPartsArray.add(currTextPart);
            currentMsgNode.set("parts", currPartsArray);
            contentsArray.add(currentMsgNode);

            requestBody.set("contents", contentsArray);

            // Define Tools
            ArrayNode toolsArray = objectMapper.createArrayNode();
            ObjectNode toolNode = objectMapper.createObjectNode();
            ArrayNode functionDeclarations = objectMapper.createArrayNode();
            
            ObjectNode createTripFunc = objectMapper.createObjectNode();
            createTripFunc.put("name", "create_trip");
            createTripFunc.put("description", "Creates a new travel trip in the user's TripNest dashboard.");
            
            ObjectNode parameters = objectMapper.createObjectNode();
            parameters.put("type", "OBJECT");
            
            ObjectNode properties = objectMapper.createObjectNode();
            
            ObjectNode titleProp = objectMapper.createObjectNode();
            titleProp.put("type", "STRING");
            titleProp.put("description", "Title of the trip (e.g., 'Summer in Paris')");
            properties.set("title", titleProp);
            
            ObjectNode destProp = objectMapper.createObjectNode();
            destProp.put("type", "STRING");
            destProp.put("description", "The destination city/country");
            properties.set("destinationName", destProp);
            
            ObjectNode startProp = objectMapper.createObjectNode();
            startProp.put("type", "STRING");
            startProp.put("description", "Start date in YYYY-MM-DD format");
            properties.set("startDate", startProp);
            
            ObjectNode endProp = objectMapper.createObjectNode();
            endProp.put("type", "STRING");
            endProp.put("description", "End date in YYYY-MM-DD format");
            properties.set("endDate", endProp);
            
            ObjectNode budgetProp = objectMapper.createObjectNode();
            budgetProp.put("type", "NUMBER");
            budgetProp.put("description", "Total budget for the trip as a number");
            properties.set("budget", budgetProp);
            
            parameters.set("properties", properties);
            
            ArrayNode requiredArray = objectMapper.createArrayNode();
            requiredArray.add("title");
            requiredArray.add("destinationName");
            requiredArray.add("startDate");
            requiredArray.add("endDate");
            requiredArray.add("budget");
            parameters.set("required", requiredArray);
            
            createTripFunc.set("parameters", parameters);
            functionDeclarations.add(createTripFunc);
            toolNode.set("functionDeclarations", functionDeclarations);
            toolsArray.add(toolNode);
            requestBody.set("tools", toolsArray);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> httpEntity = new HttpEntity<>(requestBody.toString(), headers);

            String responseString = restTemplate.postForObject(url, httpEntity, String.class);
            JsonNode root = objectMapper.readTree(responseString);
            
            JsonNode candidate = root.path("candidates").get(0);
            JsonNode part = candidate.path("content").path("parts").get(0);
            
            if (part.has("functionCall")) {
                JsonNode functionCall = part.get("functionCall");
                String name = functionCall.get("name").asText();
                if ("create_trip".equals(name)) {
                    JsonNode args = functionCall.get("args");
                    CreateTripRequest createReq = new CreateTripRequest();
                    createReq.setTitle(args.get("title").asText());
                    createReq.setDestinationName(args.get("destinationName").asText());
                    createReq.setStartDate(LocalDate.parse(args.get("startDate").asText()));
                    createReq.setEndDate(LocalDate.parse(args.get("endDate").asText()));
                    createReq.setBudget(args.get("budget").asDouble());
                    
                    tripService.createTrip(createReq, username);
                    
                    return new AiChatResponse("I have successfully created your trip to " + createReq.getDestinationName() + "! Your dashboard will update shortly.", true);
                }
            }
            
            String textResponse = part.path("text").asText();
                    
            return new AiChatResponse(textResponse.trim(), false);

        } catch (Exception e) {
            System.err.println("Failed to fetch response from Gemini API: " + e.getMessage());
            return new AiChatResponse("Sorry, I couldn't reach my AI brain right now. Please try again in a moment.");
        }
    }
}
