package com.tripnest.support.controller;

import com.tripnest.common.dto.ApiResponse;
import com.tripnest.support.dto.SupportTicketRequest;
import com.tripnest.support.dto.SupportTicketResponse;
import com.tripnest.support.dto.TicketMessageRequest;
import com.tripnest.support.dto.TicketMessageResponse;
import com.tripnest.support.service.SupportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support")
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @PostMapping("/tickets")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> createTicket(
            Authentication authentication,
            @Valid @RequestBody SupportTicketRequest request) {
        String username = authentication.getName();
        SupportTicketResponse response = supportService.createTicket(username, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Support ticket created successfully"));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<SupportTicketResponse>>> getUserTickets(
            Authentication authentication) {
        String username = authentication.getName();
        List<SupportTicketResponse> response = supportService.getUserTickets(username);
        return ResponseEntity.ok(ApiResponse.success(response, "Support tickets retrieved successfully"));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<ApiResponse<SupportTicketResponse>> getTicket(
            Authentication authentication,
            @PathVariable Long ticketId) {
        String username = authentication.getName();
        SupportTicketResponse response = supportService.getTicket(username, ticketId);
        return ResponseEntity.ok(ApiResponse.success(response, "Support ticket retrieved successfully"));
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<ApiResponse<TicketMessageResponse>> addMessage(
            Authentication authentication,
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketMessageRequest request) {
        String username = authentication.getName();
        TicketMessageResponse response = supportService.addMessage(username, ticketId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Message added successfully"));
    }

    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<ApiResponse<List<TicketMessageResponse>>> getTicketMessages(
            Authentication authentication,
            @PathVariable Long ticketId) {
        String username = authentication.getName();
        List<TicketMessageResponse> response = supportService.getTicketMessages(username, ticketId);
        return ResponseEntity.ok(ApiResponse.success(response, "Messages retrieved successfully"));
    }
}
