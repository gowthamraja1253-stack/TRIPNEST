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
    void removeMember(Long groupId, Long memberId, String username);
    void leaveGroup(Long groupId, String username);
}
