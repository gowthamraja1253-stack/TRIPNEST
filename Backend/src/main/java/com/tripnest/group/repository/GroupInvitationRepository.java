package com.tripnest.group.repository;

import com.tripnest.group.entity.GroupInvitation;
import com.tripnest.group.entity.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {

    List<GroupInvitation> findByInvitedUserUsernameAndStatus(String username, InvitationStatus status);

    List<GroupInvitation> findByTravelGroupId(Long groupId);

    List<GroupInvitation> findByTripId(Long tripId);

    Optional<GroupInvitation> findByTravelGroupIdAndInvitedUserEmailAndStatus(Long groupId, String email, InvitationStatus status);
}
