package com.tripnest.ai.controller;

import com.tripnest.ai.dto.AiChatRequest;
import com.tripnest.ai.dto.AiChatResponse;
import com.tripnest.ai.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : null;
        AiChatResponse response = aiChatService.chat(request, username);
        return ResponseEntity.ok(response);
    }
}
