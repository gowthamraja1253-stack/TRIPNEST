package com.tripnest.group.mapper;

import com.tripnest.group.dto.GroupMemberDto;
import com.tripnest.group.dto.TravelGroupDto;
import com.tripnest.group.entity.GroupMember;
import com.tripnest.group.entity.TravelGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GroupMapper {

    @Mapping(source = "createdBy.username", target = "createdByUsername")
    @Mapping(source = "trip.id", target = "tripId")
    @Mapping(source = "trip.title", target = "tripName")
    @Mapping(source = "trip.destination.name", target = "tripDestination")
    @Mapping(source = "trip.maxTravelers", target = "maxTravelers")
    TravelGroupDto toDto(TravelGroup travelGroup);

    List<TravelGroupDto> toDtoList(List<TravelGroup> travelGroups);

    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.firstName", target = "firstName")
    @Mapping(source = "user.lastName", target = "lastName")
    @Mapping(source = "user.profilePictureUrl", target = "profilePictureUrl")
    GroupMemberDto toMemberDto(GroupMember member);

    List<GroupMemberDto> toMemberDtoList(List<GroupMember> members);
}
