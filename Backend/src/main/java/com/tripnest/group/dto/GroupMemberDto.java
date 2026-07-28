package com.tripnest.group.dto;

import com.tripnest.group.entity.GroupRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GroupMemberDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private GroupRole role;
    private LocalDateTime joinedAt;
}
