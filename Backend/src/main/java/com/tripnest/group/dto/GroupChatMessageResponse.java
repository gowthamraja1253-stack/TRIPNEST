package com.tripnest.group.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GroupChatMessageResponse {
    private Long id;
    private String message;
    private String senderUsername;
    private String senderFirstName;
    private String senderLastName;
    private LocalDateTime createdAt;
}
