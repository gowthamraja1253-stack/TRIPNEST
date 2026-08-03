package com.tripnest.group.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupChatMessageRequest {
    @NotBlank(message = "Message cannot be empty")
    private String message;
}
