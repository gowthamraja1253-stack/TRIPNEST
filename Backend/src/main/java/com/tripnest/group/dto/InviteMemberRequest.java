package com.tripnest.group.dto;

import com.tripnest.group.entity.GroupRole;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InviteMemberRequest {
    @NotBlank(message = "Username or email is required")
    private String usernameOrEmail;
    
    private GroupRole role = GroupRole.MEMBER;
}
