package com.tripnest.group.service;

import com.tripnest.group.dto.CreateGroupRequest;
import com.tripnest.group.dto.InviteMemberRequest;
import com.tripnest.group.dto.TravelGroupDto;

import java.util.List;

public interface GroupService {
    TravelGroupDto createGroup(CreateGroupRequest request, String username);
    List<TravelGroupDto> getUserGroups(String username);
    TravelGroupDto getGroupDetails(Long groupId, String username);
    TravelGroupDto updateGroup(Long groupId, CreateGroupRequest request, String username);
    void deleteGroup(Long groupId, String username);
    void inviteMember(Long groupId, InviteMemberRequest request, String username);
    com.tripnest.group.dto.GroupInvitationDto inviteByEmail(Long groupId, com.tripnest.group.dto.InviteByEmailRequest request, String username);
    List<com.tripnest.group.dto.GroupInvitationDto> getPendingInvitations(String username);
    List<com.tripnest.group.dto.GroupInvitationDto> getGroupInvitations(Long groupId, String username);
    void acceptInvitation(Long invitationId, String username);
    void rejectInvitation(Long invitationId, String username);
    void cancelInvitation(Long groupId, Long invitationId, String username);
    void updateMemberRole(Long groupId, Long memberId, String role, String username);
    void transferOwnership(Long groupId, Long newAdminMemberId, String username);
    void removeMember(Long groupId, Long memberId, String username);
    void leaveGroup(Long groupId, String username);
    com.tripnest.group.dto.GroupChatMessageResponse sendGroupMessage(Long groupId, com.tripnest.group.dto.GroupChatMessageRequest request, String username);
    List<com.tripnest.group.dto.GroupChatMessageResponse> getGroupMessages(Long groupId, String username);
}
