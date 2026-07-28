package com.tripnest.support.repository;

import com.tripnest.support.entity.SupportTicket;
import com.tripnest.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByUser(User user);
    List<SupportTicket> findByUserOrderByCreatedAtDesc(User user);
}
