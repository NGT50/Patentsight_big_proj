package com.patentsight.ai.controller;

import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/chat")
public class AiChatController {

    private final ChatService chatService;

    public AiChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionResponse> startSession(@RequestBody ChatSessionRequest request) {
        return ResponseEntity.ok(chatService.startSession(request));
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable String sessionId,
            @RequestBody ChatMessageRequest request
    ) {
        return ResponseEntity.ok(chatService.sendMessage(sessionId, request));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getHistory(@PathVariable String sessionId) {
        return ResponseEntity.ok(chatService.getChatHistory(sessionId));
    }

    @PatchMapping("/sessions/{sessionId}/end")
    public ResponseEntity<ChatEndResponse> endSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(chatService.endSession(sessionId));
    }
}
