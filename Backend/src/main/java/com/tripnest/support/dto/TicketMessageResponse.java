package com.tripnest.support.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketMessageResponse {
    private Long id;
    private String message;
    private Long senderId;
    private String senderName;
    private LocalDateTime createdAt;
}
