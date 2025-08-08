package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.ChatService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ChatServiceMockImpl implements ChatService {

    @Override
    public ChatSessionResponse startSession(ChatSessionRequest request) {
        return new ChatSessionResponse("session-" + request.getPatentId(), LocalDateTime.now().toString());
    }

    @Override
    public ChatMessageResponse sendMessage(String sessionId, ChatMessageRequest request) {
        return new ChatMessageResponse(
                "msg-001",
                "ai",
                "AI 응답입니다: " + request.getMessage(),
                List.of("similarity", "check"),
                List.of("90%", "pass"),
                LocalDateTime.now().toString()
        );
    }

    @Override
    public List<ChatMessageResponse> getChatHistory(String sessionId) {
        List<ChatMessageResponse> history = new ArrayList<>();
        history.add(new ChatMessageResponse("msg-001", "user", "이건 사용자 질문", List.of(), List.of(), "2025-08-07T10:00:00"));
        history.add(new ChatMessageResponse("msg-002", "ai", "AI 응답입니다", List.of("check"), List.of("OK"), "2025-08-07T10:00:01"));
        return history;
    }

    @Override
    public ChatEndResponse endSession(String sessionId) {
        return new ChatEndResponse(sessionId, LocalDateTime.now().toString(), "이 요약은 mock입니다.");
    }
}
