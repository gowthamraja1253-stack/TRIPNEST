package com.tripnest.group.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateGroupRequest {
    @NotBlank(message = "Group name is required")
    private String name;
    
    private String description;
    
    private String coverImageUrl;

    private Long tripId;
}
