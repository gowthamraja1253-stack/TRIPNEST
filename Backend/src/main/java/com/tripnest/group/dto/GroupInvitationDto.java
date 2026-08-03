package com.tripnest.group.dto;

import com.tripnest.group.entity.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupInvitationDto {
    private Long id;
    private Long groupId;
    private String groupName;
    private Long tripId;
    private String tripName;
    private String invitedUserEmail;
    private String invitedUserUsername;
    private String invitedByName;
    private InvitationStatus status;
    private LocalDateTime createdAt;
}
