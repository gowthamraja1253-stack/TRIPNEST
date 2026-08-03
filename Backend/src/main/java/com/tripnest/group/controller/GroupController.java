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
            @PathVariable("id") Long id) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        TravelGroupDto group = groupService.getGroupDetails(id, username);
        return ResponseEntity.ok(ApiResponse.success(group, "Group details retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TravelGroupDto>> updateGroup(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateGroupRequest request) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        TravelGroupDto group = groupService.updateGroup(id, request, username);
        return ResponseEntity.ok(ApiResponse.success(group, "Group updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(
            Authentication authentication,
            @PathVariable("id") Long id) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.deleteGroup(id, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Group deleted successfully"));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<Void>> inviteMember(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody InviteMemberRequest request) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.inviteMember(id, request, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Member invited successfully"));
    }

    @PostMapping("/{id}/invitations/email")
    public ResponseEntity<ApiResponse<com.tripnest.group.dto.GroupInvitationDto>> inviteByEmail(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody com.tripnest.group.dto.InviteByEmailRequest request) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        com.tripnest.group.dto.GroupInvitationDto invitation = groupService.inviteByEmail(id, request, username);
        return ResponseEntity.ok(ApiResponse.success(invitation, "Invitation sent successfully"));
    }

    @GetMapping("/invitations/pending")
    public ResponseEntity<ApiResponse<List<com.tripnest.group.dto.GroupInvitationDto>>> getPendingInvitations(
            Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        List<com.tripnest.group.dto.GroupInvitationDto> invitations = groupService.getPendingInvitations(username);
        return ResponseEntity.ok(ApiResponse.success(invitations, "Pending invitations retrieved successfully"));
    }

    @GetMapping("/{id}/invitations")
    public ResponseEntity<ApiResponse<List<com.tripnest.group.dto.GroupInvitationDto>>> getGroupInvitations(
            Authentication authentication,
            @PathVariable("id") Long id) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        List<com.tripnest.group.dto.GroupInvitationDto> invitations = groupService.getGroupInvitations(id, username);
        return ResponseEntity.ok(ApiResponse.success(invitations, "Group invitations retrieved successfully"));
    }

    @PutMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptInvitation(
            Authentication authentication,
            @PathVariable("invitationId") Long invitationId) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.acceptInvitation(invitationId, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Invitation accepted successfully"));
    }

    @PutMapping("/invitations/{invitationId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectInvitation(
            Authentication authentication,
            @PathVariable("invitationId") Long invitationId) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.rejectInvitation(invitationId, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Invitation rejected successfully"));
    }

    @DeleteMapping("/{id}/invitations/{invitationId}")
    public ResponseEntity<ApiResponse<Void>> cancelInvitation(
            Authentication authentication,
            @PathVariable("id") Long id,
            @PathVariable("invitationId") Long invitationId) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.cancelInvitation(id, invitationId, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Invitation cancelled successfully"));
    }

    @PutMapping("/{id}/members/{memberId}/role")
    public ResponseEntity<ApiResponse<Void>> updateMemberRole(
            Authentication authentication,
            @PathVariable("id") Long id,
            @PathVariable("memberId") Long memberId,
            @RequestParam("role") String role) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.updateMemberRole(id, memberId, role, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Member role updated successfully"));
    }

    @PutMapping("/{id}/transfer-ownership")
    public ResponseEntity<ApiResponse<Void>> transferOwnership(
            Authentication authentication,
            @PathVariable("id") Long id,
            @RequestParam("newAdminMemberId") Long newAdminMemberId) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.transferOwnership(id, newAdminMemberId, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Ownership transferred successfully"));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            Authentication authentication,
            @PathVariable("id") Long id,
            @PathVariable("memberId") Long memberId) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.removeMember(id, memberId, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed successfully"));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            Authentication authentication,
            @PathVariable("id") Long id) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        groupService.leaveGroup(id, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Successfully left the group"));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<com.tripnest.group.dto.GroupChatMessageResponse>> sendGroupMessage(
            Authentication authentication,
            @PathVariable("id") Long id,
            @Valid @RequestBody com.tripnest.group.dto.GroupChatMessageRequest request) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        com.tripnest.group.dto.GroupChatMessageResponse response = groupService.sendGroupMessage(id, request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Message sent successfully"));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<com.tripnest.group.dto.GroupChatMessageResponse>>> getGroupMessages(
            Authentication authentication,
            @PathVariable("id") Long id) {
        String username = (authentication != null) ? authentication.getName() : "testuser";
        List<com.tripnest.group.dto.GroupChatMessageResponse> response = groupService.getGroupMessages(id, username);
        return ResponseEntity.ok(ApiResponse.success(response, "Messages retrieved successfully"));
    }
}
