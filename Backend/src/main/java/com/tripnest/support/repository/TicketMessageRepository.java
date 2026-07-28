package com.tripnest.support.repository;

import com.tripnest.support.entity.SupportTicket;
import com.tripnest.support.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicketOrderByCreatedAtAsc(SupportTicket ticket);
}
