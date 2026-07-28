package com.tripnest.group.service;

import com.tripnest.exception.BadRequestException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedAccessException;
import com.tripnest.group.dto.CreateGroupRequest;
import com.tripnest.group.dto.InviteMemberRequest;
import com.tripnest.group.dto.TravelGroupDto;
import com.tripnest.group.entity.GroupMember;
import com.tripnest.group.entity.GroupRole;
import com.tripnest.group.entity.TravelGroup;
import com.tripnest.group.mapper.GroupMapper;
import com.tripnest.group.repository.GroupMemberRepository;
import com.tripnest.group.repository.TravelGroupRepository;
import com.tripnest.user.entity.User;
import com.tripnest.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GroupServiceImpl implements GroupService {

    private final TravelGroupRepository travelGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final GroupMapper groupMapper;

    public GroupServiceImpl(TravelGroupRepository travelGroupRepository,
                            GroupMemberRepository groupMemberRepository,
                            UserRepository userRepository,
                            GroupMapper groupMapper) {
        this.travelGroupRepository = travelGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.groupMapper = groupMapper;
    }

    @Override
    @Transactional
    public TravelGroupDto createGroup(CreateGroupRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TravelGroup group = TravelGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .coverImageUrl(request.getCoverImageUrl())
                .createdBy(creator)
                .build();

        GroupMember adminMember = GroupMember.builder()
                .travelGroup(group)
                .user(creator)
                .role(GroupRole.ADMIN)
                .build();

        group.getMembers().add(adminMember);

        TravelGroup savedGroup = travelGroupRepository.save(group);
        return groupMapper.toDto(savedGroup);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelGroupDto> getUserGroups(String username) {
        List<TravelGroup> groups = travelGroupRepository.findAllByMemberUsername(username);
        return groupMapper.toDtoList(groups);
    }

    @Override
    @Transactional(readOnly = true)
    public TravelGroupDto getGroupDetails(Long groupId, String username) {
        TravelGroup group = getGroupAndVerifyMembership(groupId, username);
        return groupMapper.toDto(group);
    }

    @Override
    @Transactional
    public TravelGroupDto updateGroup(Long groupId, CreateGroupRequest request, String username) {
        TravelGroup group = getGroupAndVerifyAdmin(groupId, username);
        
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setCoverImageUrl(request.getCoverImageUrl());
        
        TravelGroup savedGroup = travelGroupRepository.save(group);
        return groupMapper.toDto(savedGroup);
    }

    @Override
    @Transactional
    public void deleteGroup(Long groupId, String username) {
        TravelGroup group = getGroupAndVerifyAdmin(groupId, username);
        travelGroupRepository.delete(group);
    }

    @Override
    @Transactional
    public void inviteMember(Long groupId, InviteMemberRequest request, String username) {
        TravelGroup group = getGroupAndVerifyAdmin(groupId, username);
        
        User targetUser = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username/email: " + request.getUsernameOrEmail()));
                
        // Check if already a member
        boolean isAlreadyMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(targetUser.getId()));
                
        if (isAlreadyMember) {
            throw new BadRequestException("User is already a member of this group");
        }
        
        GroupMember newMember = GroupMember.builder()
                .travelGroup(group)
                .user(targetUser)
                .role(request.getRole())
                .build();
                
        group.getMembers().add(newMember);
        travelGroupRepository.save(group);
    }

    @Override
    @Transactional
    public void removeMember(Long groupId, Long memberId, String username) {
        TravelGroup group = getGroupAndVerifyAdmin(groupId, username);
        
        GroupMember targetMember = group.getMembers().stream()
                .filter(m -> m.getId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this group"));
                
        if (targetMember.getUser().getUsername().equals(username)) {
            throw new BadRequestException("You cannot remove yourself using this endpoint. Use the leave group endpoint.");
        }
        
        // Don't allow removing the creator
        if (targetMember.getUser().getId().equals(group.getCreatedBy().getId())) {
            throw new BadRequestException("Cannot remove the creator of the group");
        }
        
        group.getMembers().remove(targetMember);
        travelGroupRepository.save(group);
    }

    @Override
    @Transactional
    public void leaveGroup(Long groupId, String username) {
        TravelGroup group = getGroupAndVerifyMembership(groupId, username);
        
        GroupMember currentMember = group.getMembers().stream()
                .filter(m -> m.getUser().getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
                
        // If the creator leaves, we either need to reassign creator or delete the group.
        // For simplicity, prevent creator from leaving without deleting.
        if (group.getCreatedBy().getUsername().equals(username)) {
            throw new BadRequestException("As the group creator, you must delete the group instead of leaving it, or transfer ownership (feature coming soon).");
        }
        
        group.getMembers().remove(currentMember);
        travelGroupRepository.save(group);
    }
    
    private TravelGroup getGroupAndVerifyMembership(Long groupId, String username) {
        TravelGroup group = travelGroupRepository.findByIdWithMembers(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel Group not found"));
                
        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getUsername().equals(username));
                
        if (!isMember) {
            throw new UnauthorizedAccessException("You are not a member of this group");
        }
        
        return group;
    }
    
    private TravelGroup getGroupAndVerifyAdmin(Long groupId, String username) {
        TravelGroup group = getGroupAndVerifyMembership(groupId, username);
        
        GroupMember currentMember = group.getMembers().stream()
                .filter(m -> m.getUser().getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
                
        if (currentMember.getRole() != GroupRole.ADMIN) {
            throw new UnauthorizedAccessException("You must be a group admin to perform this action");
        }
        
        return group;
    }
}
