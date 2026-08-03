package com.tripnest.trip.dto;

import com.tripnest.trip.entity.DocumentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private String name;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private DocumentCategory category;
    private LocalDateTime uploadedAt;
    private Long tripId;
    private String tripName;
}
