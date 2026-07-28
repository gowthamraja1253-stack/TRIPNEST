package com.tripnest.group.dto;

import com.tripnest.group.entity.GroupRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TravelGroupDto {
    private Long id;
    private String name;
    private String description;
    private String coverImageUrl;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private List<GroupMemberDto> members;
}
