package com.tripnest.group.repository;

import com.tripnest.group.entity.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
    List<GroupChatMessage> findByTravelGroupIdOrderByCreatedAtAsc(Long groupId);
}
