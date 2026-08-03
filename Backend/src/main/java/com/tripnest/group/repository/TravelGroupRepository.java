package com.tripnest.group.repository;

import com.tripnest.group.entity.TravelGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelGroupRepository extends JpaRepository<TravelGroup, Long> {
    
    @Query("SELECT tg FROM TravelGroup tg JOIN tg.members m WHERE m.user.username = :username")
    List<TravelGroup> findAllByMemberUsername(@Param("username") String username);

    @Query("SELECT tg FROM TravelGroup tg LEFT JOIN FETCH tg.members m LEFT JOIN FETCH m.user WHERE tg.id = :id")
    Optional<TravelGroup> findByIdWithMembers(@Param("id") Long id);

    List<TravelGroup> findByTripId(Long tripId);
}
