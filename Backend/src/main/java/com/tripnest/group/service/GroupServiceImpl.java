package com.tripnest.group.service;

import com.tripnest.exception.BadRequestException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedAccessException;
import com.tripnest.group.dto.CreateGroupRequest;
import com.tripnest.group.dto.InviteMemberRequest;
import com.tripnest.group.dto.TravelGroupDto;
import com.tripnest.group.dto.GroupChatMessageRequest;
import com.tripnest.group.dto.GroupChatMessageResponse;
import com.tripnest.group.entity.GroupMember;
import com.tripnest.group.entity.GroupRole;
import com.tripnest.group.entity.TravelGroup;
import com.tripnest.group.entity.GroupInvitation;
import com.tripnest.group.entity.GroupChatMessage;
import com.tripnest.group.mapper.GroupMapper;
import com.tripnest.group.repository.GroupMemberRepository;
import com.tripnest.group.repository.TravelGroupRepository;
import com.tripnest.group.repository.GroupChatMessageRepository;
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
    private final com.tripnest.group.repository.GroupInvitationRepository groupInvitationRepository;
    private final com.tripnest.notification.service.NotificationService notificationService;
    private final com.tripnest.trip.repository.TripRepository tripRepository;
    private final GroupChatMessageRepository groupChatMessageRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public GroupServiceImpl(TravelGroupRepository travelGroupRepository,
                            GroupMemberRepository groupMemberRepository,
                            UserRepository userRepository,
                            GroupMapper groupMapper,
                            com.tripnest.group.repository.GroupInvitationRepository groupInvitationRepository,
                            com.tripnest.notification.service.NotificationService notificationService,
                            com.tripnest.trip.repository.TripRepository tripRepository,
                            GroupChatMessageRepository groupChatMessageRepository,
                            org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.travelGroupRepository = travelGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.groupMapper = groupMapper;
        this.groupInvitationRepository = groupInvitationRepository;
        this.notificationService = notificationService;
        this.tripRepository = tripRepository;
        this.groupChatMessageRepository = groupChatMessageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public TravelGroupDto createGroup(CreateGroupRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        com.tripnest.trip.entity.Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepository.findById(request.getTripId()).orElse(null);
            if (trip != null) {
                List<TravelGroup> existingGroups = travelGroupRepository.findByTripId(trip.getId());
                if (!existingGroups.isEmpty()) {
                    throw new BadRequestException("A travel group is already linked to this trip.");
                }
            }
        }

        TravelGroup group = TravelGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .coverImageUrl(request.getCoverImageUrl())
                .createdBy(creator)
                .trip(trip)
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
        List<GroupInvitation> invitations = groupInvitationRepository.findByTravelGroupId(groupId);
        if (!invitations.isEmpty()) {
            groupInvitationRepository.deleteAll(invitations);
        }
        travelGroupRepository.delete(group);
    }

    @Override
    @Transactional
    public void inviteMember(Long groupId, InviteMemberRequest request, String username) {
        TravelGroup group = getGroupAndVerifyAdmin(groupId, username);
        
        if (group.getTrip() != null && group.getTrip().getMaxTravelers() != null) {
            int maxCap = group.getTrip().getMaxTravelers();
            if (group.getMembers().size() >= maxCap) {
                throw new BadRequestException("Cannot add member. Group member limit of " + maxCap + " reached for this trip.");
            }
        }

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

        try {
            notificationService.createNotification(
                targetUser.getUsername(),
                "Added to Group: " + group.getName(),
                username + " added you to the travel group " + group.getName(),
                com.tripnest.notification.entity.NotificationType.GROUP_INVITE,
                "/dashboard/groups/" + group.getId()
            );
        } catch (Exception e) {
            // Ignore
        }
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
            throw new BadRequestException("As the group admin/creator, you must transfer ownership first or delete the group instead of leaving it.");
        }
        
        group.getMembers().remove(currentMember);
        travelGroupRepository.save(group);

        // Remove from associated trip travelers list if present
        if (group.getTrip() != null) {
            com.tripnest.trip.entity.Trip trip = group.getTrip();
            trip.getTravelers().remove(currentMember.getUser());
            tripRepository.save(trip);
        }
    }

    @Override
    @Transactional
    public com.tripnest.group.dto.GroupInvitationDto inviteByEmail(Long groupId, com.tripnest.group.dto.InviteByEmailRequest request, String username) {
        TravelGroup group = getGroupAndVerifyAdmin(groupId, username);
        
        if (group.getTrip() != null && group.getTrip().getMaxTravelers() != null) {
            int maxCap = group.getTrip().getMaxTravelers();
            if (group.getMembers().size() >= maxCap) {
                throw new BadRequestException("Cannot invite member. Group member limit of " + maxCap + " reached for this trip.");
            }
        }

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User targetUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + request.getEmail() + " is not registered on TripNest"));

        boolean isAlreadyMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(targetUser.getId()));

        if (isAlreadyMember) {
            throw new BadRequestException("User is already a member of this group");
        }

        com.tripnest.trip.entity.Trip trip = null;
        if (request.getTripId() != null) {
            trip = tripRepository.findById(request.getTripId()).orElse(null);
        }

        com.tripnest.group.entity.GroupInvitation invitation = com.tripnest.group.entity.GroupInvitation.builder()
                .travelGroup(group)
                .trip(trip)
                .invitedUser(targetUser)
                .invitedBy(sender)
                .status(com.tripnest.group.entity.InvitationStatus.PENDING)
                .build();

        com.tripnest.group.entity.GroupInvitation saved = groupInvitationRepository.save(invitation);

        try {
            notificationService.createNotification(
                targetUser.getUsername(),
                "Group Invitation: " + group.getName(),
                (sender.getFirstName() != null ? sender.getFirstName() : sender.getUsername()) + " invited you to join " + group.getName(),
                com.tripnest.notification.entity.NotificationType.GROUP_INVITE,
                "/dashboard/groups"
            );
        } catch (Exception e) {
            // Ignore
        }

        return mapToInvitationDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.tripnest.group.dto.GroupInvitationDto> getPendingInvitations(String username) {
        List<com.tripnest.group.entity.GroupInvitation> list = groupInvitationRepository
                .findByInvitedUserUsernameAndStatus(username, com.tripnest.group.entity.InvitationStatus.PENDING);
        return list.stream().map(this::mapToInvitationDto).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.tripnest.group.dto.GroupInvitationDto> getGroupInvitations(Long groupId, String username) {
        getGroupAndVerifyAdmin(groupId, username);
        List<com.tripnest.group.entity.GroupInvitation> list = groupInvitationRepository.findByTravelGroupId(groupId);
        return list.stream().map(this::mapToInvitationDto).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void acceptInvitation(Long invitationId, String username) {
        com.tripnest.group.entity.GroupInvitation invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getInvitedUser().getUsername().equals(username)) {
            throw new UnauthorizedAccessException("Not authorized to respond to this invitation");
        }

        if (invitation.getStatus() != com.tripnest.group.entity.InvitationStatus.PENDING) {
            throw new BadRequestException("Invitation is no longer pending");
        }

        invitation.setStatus(com.tripnest.group.entity.InvitationStatus.ACCEPTED);
        groupInvitationRepository.save(invitation);

        TravelGroup group = invitation.getTravelGroup();
        boolean isAlreadyMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(invitation.getInvitedUser().getId()));

        if (!isAlreadyMember) {
            if (group.getTrip() != null && group.getTrip().getMaxTravelers() != null) {
                int maxCap = group.getTrip().getMaxTravelers();
                if (group.getMembers().size() >= maxCap) {
                    throw new BadRequestException("Cannot join group. Group member limit of " + maxCap + " reached.");
                }
            }
            GroupMember newMember = GroupMember.builder()
                    .travelGroup(group)
                    .user(invitation.getInvitedUser())
                    .role(GroupRole.MEMBER)
                    .build();
            group.getMembers().add(newMember);
            travelGroupRepository.save(group);
        }

        if (invitation.getTrip() != null) {
            com.tripnest.trip.entity.Trip trip = invitation.getTrip();
            trip.getTravelers().add(invitation.getInvitedUser());
            tripRepository.save(trip);
        }

        try {
            notificationService.createNotification(
                invitation.getInvitedBy().getUsername(),
                "Invitation Accepted",
                invitation.getInvitedUser().getUsername() + " accepted your invitation to join " + group.getName(),
                com.tripnest.notification.entity.NotificationType.GROUP_INVITE,
                "/dashboard/groups/" + group.getId()
            );
        } catch (Exception e) {
            // Ignore
        }
    }

    @Override
    @Transactional
    public void rejectInvitation(Long invitationId, String username) {
        com.tripnest.group.entity.GroupInvitation invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getInvitedUser().getUsername().equals(username)) {
            throw new UnauthorizedAccessException("Not authorized to respond to this invitation");
        }

        invitation.setStatus(com.tripnest.group.entity.InvitationStatus.REJECTED);
        groupInvitationRepository.save(invitation);

        try {
            notificationService.createNotification(
                invitation.getInvitedBy().getUsername(),
                "Invitation Declined",
                invitation.getInvitedUser().getUsername() + " declined your invitation to join " + invitation.getTravelGroup().getName(),
                com.tripnest.notification.entity.NotificationType.GENERAL,
                "/dashboard/groups/" + invitation.getTravelGroup().getId()
            );
        } catch (Exception e) {
            // Ignore
        }
    }

    @Override
    @Transactional
    public void cancelInvitation(Long groupId, Long invitationId, String username) {
        getGroupAndVerifyAdmin(groupId, username);
        com.tripnest.group.entity.GroupInvitation invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
        invitation.setStatus(com.tripnest.group.entity.InvitationStatus.CANCELLED);
        groupInvitationRepository.save(invitation);
    }

    @Override
    @Transactional
    public void updateMemberRole(Long groupId, Long memberId, String roleStr, String username) {
        TravelGroup group = getGroupAndVerifyAdmin(groupId, username);
        GroupMember member = group.getMembers().stream()
                .filter(m -> m.getId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        try {
            GroupRole newRole = GroupRole.valueOf(roleStr.toUpperCase());
            member.setRole(newRole);
            groupMemberRepository.save(member);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid group role: " + roleStr);
        }
    }

    @Override
    @Transactional
    public void transferOwnership(Long groupId, Long newAdminMemberId, String username) {
        TravelGroup group = getGroupAndVerifyAdmin(groupId, username);
        GroupMember targetMember = group.getMembers().stream()
                .filter(m -> m.getId().equals(newAdminMemberId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Target member not found"));

        targetMember.setRole(GroupRole.ADMIN);
        groupMemberRepository.save(targetMember);

        // Update old admin's role to MEMBER
        GroupMember oldAdmin = group.getMembers().stream()
                .filter(m -> m.getUser().getUsername().equals(username))
                .findFirst()
                .orElse(null);
        if (oldAdmin != null) {
            oldAdmin.setRole(GroupRole.MEMBER);
            groupMemberRepository.save(oldAdmin);
        }

        group.setCreatedBy(targetMember.getUser());
        travelGroupRepository.save(group);
    }

    private com.tripnest.group.dto.GroupInvitationDto mapToInvitationDto(com.tripnest.group.entity.GroupInvitation inv) {
        return com.tripnest.group.dto.GroupInvitationDto.builder()
                .id(inv.getId())
                .groupId(inv.getTravelGroup().getId())
                .groupName(inv.getTravelGroup().getName())
                .tripId(inv.getTrip() != null ? inv.getTrip().getId() : null)
                .tripName(inv.getTrip() != null && inv.getTrip().getDestination() != null ? inv.getTrip().getDestination().getName() : null)
                .invitedUserEmail(inv.getInvitedUser().getEmail())
                .invitedUserUsername(inv.getInvitedUser().getUsername())
                .invitedByName(inv.getInvitedBy().getFirstName() != null ? inv.getInvitedBy().getFirstName() : inv.getInvitedBy().getUsername())
                .status(inv.getStatus())
                .createdAt(inv.getCreatedAt())
                .build();
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

    @Override
    @Transactional
    public GroupChatMessageResponse sendGroupMessage(Long groupId, GroupChatMessageRequest request, String username) {
        TravelGroup group = getGroupAndVerifyMembership(groupId, username);
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        GroupChatMessage chatMessage = GroupChatMessage.builder()
                .travelGroup(group)
                .sender(sender)
                .message(request.getMessage())
                .build();

        GroupChatMessage saved = groupChatMessageRepository.save(chatMessage);

        GroupChatMessageResponse response = GroupChatMessageResponse.builder()
                .id(saved.getId())
                .message(saved.getMessage())
                .senderUsername(saved.getSender().getUsername())
                .senderFirstName(saved.getSender().getFirstName())
                .senderLastName(saved.getSender().getLastName())
                .createdAt(saved.getCreatedAt())
                .build();

        try {
            messagingTemplate.convertAndSend("/topic/groups/" + groupId, response);
        } catch (Exception e) {
            // Ignore broker exceptions
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupChatMessageResponse> getGroupMessages(Long groupId, String username) {
        getGroupAndVerifyMembership(groupId, username);
        List<GroupChatMessage> messages = groupChatMessageRepository.findByTravelGroupIdOrderByCreatedAtAsc(groupId);
        return messages.stream()
                .map(m -> GroupChatMessageResponse.builder()
                        .id(m.getId())
                        .message(m.getMessage())
                        .senderUsername(m.getSender().getUsername())
                        .senderFirstName(m.getSender().getFirstName())
                        .senderLastName(m.getSender().getLastName())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
