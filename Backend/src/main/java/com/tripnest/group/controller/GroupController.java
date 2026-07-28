package com.tripnest.group.controller;

import com.tripnest.common.dto.ApiResponse;
import com.tripnest.group.dto.CreateGroupRequest;
import com.tripnest.group.dto.InviteMemberRequest;
import com.tripnest.group.dto.TravelGroupDto;
import com.tripnest.group.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TravelGroupDto>> createGroup(
            Authentication authentication,
            @Valid @RequestBody CreateGroupRequest request) {
        String username = authentication.getName();
        TravelGroupDto group = groupService.createGroup(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(group, "Group created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TravelGroupDto>>> getUserGroups(Authentication authentication) {
        String username = authentication.getName();
        List<TravelGroupDto> groups = groupService.getUserGroups(username);
        return ResponseEntity.ok(ApiResponse.success(groups, "Groups retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TravelGroupDto>> getGroupDetails(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        TravelGroupDto group = groupService.getGroupDetails(id, username);
        return ResponseEntity.ok(ApiResponse.success(group, "Group details retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TravelGroupDto>> updateGroup(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CreateGroupRequest request) {
        String username = authentication.getName();
        TravelGroupDto group = groupService.updateGroup(id, request, username);
        return ResponseEntity.ok(ApiResponse.success(group, "Group updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        groupService.deleteGroup(id, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Group deleted successfully"));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<Void>> inviteMember(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody InviteMemberRequest request) {
        String username = authentication.getName();
        groupService.inviteMember(id, request, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Member invited successfully"));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            Authentication authentication,
            @PathVariable Long id,
            @PathVariable Long memberId) {
        String username = authentication.getName();
        groupService.removeMember(id, memberId, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed successfully"));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        groupService.leaveGroup(id, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Successfully left the group"));
    }
}
