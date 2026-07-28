package com.tripnest.support.service;

import com.tripnest.support.dto.SupportTicketRequest;
import com.tripnest.support.dto.SupportTicketResponse;
import com.tripnest.support.dto.TicketMessageRequest;
import com.tripnest.support.dto.TicketMessageResponse;

import java.util.List;

public interface SupportService {
    SupportTicketResponse createTicket(String username, SupportTicketRequest request);
    List<SupportTicketResponse> getUserTickets(String username);
    SupportTicketResponse getTicket(String username, Long ticketId);
    TicketMessageResponse addMessage(String username, Long ticketId, TicketMessageRequest request);
    List<TicketMessageResponse> getTicketMessages(String username, Long ticketId);
}
