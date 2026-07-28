package com.tripnest.support.service;

import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.support.dto.SupportTicketRequest;
import com.tripnest.support.dto.SupportTicketResponse;
import com.tripnest.support.dto.TicketMessageRequest;
import com.tripnest.support.dto.TicketMessageResponse;
import com.tripnest.support.entity.SupportTicket;
import com.tripnest.support.entity.TicketMessage;
import com.tripnest.support.entity.TicketStatus;
import com.tripnest.support.repository.SupportTicketRepository;
import com.tripnest.support.repository.TicketMessageRepository;
import com.tripnest.user.entity.User;
import com.tripnest.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupportServiceImpl implements SupportService {

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;
    private final UserRepository userRepository;

    public SupportServiceImpl(SupportTicketRepository ticketRepository, TicketMessageRepository messageRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public SupportTicketResponse createTicket(String username, SupportTicketRequest request) {
        User user = getUser(username);
        SupportTicket ticket = SupportTicket.builder()
                .subject(request.getSubject())
                .description(request.getDescription())
                .status(TicketStatus.OPEN)
                .user(user)
                .build();
        ticket = ticketRepository.save(ticket);
        return mapToTicketResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getUserTickets(String username) {
        User user = getUser(username);
        return ticketRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketResponse getTicket(String username, Long ticketId) {
        SupportTicket ticket = getTicketForUser(username, ticketId);
        return mapToTicketResponse(ticket);
    }

    @Override
    @Transactional
    public TicketMessageResponse addMessage(String username, Long ticketId, TicketMessageRequest request) {
        SupportTicket ticket = getTicketForUser(username, ticketId);
        User user = getUser(username);
        
        TicketMessage message = TicketMessage.builder()
                .message(request.getMessage())
                .ticket(ticket)
                .sender(user)
                .build();
                
        message = messageRepository.save(message);
        
        // Update ticket status if adding a message
        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            ticketRepository.save(ticket);
        }
        
        return mapToMessageResponse(message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketMessageResponse> getTicketMessages(String username, Long ticketId) {
        SupportTicket ticket = getTicketForUser(username, ticketId);
        return messageRepository.findByTicketOrderByCreatedAtAsc(ticket).stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private SupportTicket getTicketForUser(String username, Long ticketId) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        if (!ticket.getUser().getUsername().equals(username)) {
            throw new ResourceNotFoundException("Ticket not found");
        }
        return ticket;
    }

    private SupportTicketResponse mapToTicketResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus().name())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private TicketMessageResponse mapToMessageResponse(TicketMessage message) {
        return TicketMessageResponse.builder()
                .id(message.getId())
                .message(message.getMessage())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
