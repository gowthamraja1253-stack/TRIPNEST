package com.tripnest.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AiChatResponse {
    private String message;
    private boolean tripCreated;

    public AiChatResponse(String message) {
        this.message = message;
        this.tripCreated = false;
    }

    public AiChatResponse(String message, boolean tripCreated) {
        this.message = message;
        this.tripCreated = tripCreated;
    }
}
