package com.tripnest.group.repository;

import com.tripnest.group.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Optional<GroupMember> findByTravelGroupIdAndUserUsername(Long travelGroupId, String username);
}
