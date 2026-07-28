package com.tripnest.trip.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddDocumentRequest {
    @NotBlank(message = "Document name is required")
    private String name;
    
    @NotBlank(message = "File URL is required")
    private String fileUrl;
    
    private String fileType;
    private Long fileSize;
}
