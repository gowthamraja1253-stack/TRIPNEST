package com.tripnest.support.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketMessageRequest {
    @NotBlank(message = "Message is required")
    private String message;
}
