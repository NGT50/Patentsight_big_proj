package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.*;
import com.patentsight.ai.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final WebClient.Builder webClientBuilder;

    // application.yml 에서 가져오기
    @Value("${external-api.chatbot-url}")
    private String chatbotUrl;

    // 세션별 대화 기록 저장 (임시, 이후 DB 연동 가능)
    private final Map<String, List<ChatMessageResponse>> sessions = new HashMap<>();

    @Override
    public ChatSessionResponse startSession(ChatSessionRequest request) {
        String sessionId = UUID.randomUUID().toString();
        sessions.put(sessionId, new ArrayList<>());

        // 생성자 방식으로 간단히
        return new ChatSessionResponse(sessionId, "STARTED");
    }

    @Override
    public ChatMessageResponse sendMessage(String sessionId, ChatMessageRequest request) {
        // FastAPI 호출
        String answer = webClientBuilder.build()
                .post()
                .uri(chatbotUrl)
                .bodyValue(Map.of(
                        "session_id", sessionId,
                        "user_msg", request.getMessage(),
                        "application_text", "",   // 필요시 채우기
                        "claims_text", ""         // 필요시 채우기
                ))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // 사용자 메시지 기록
        ChatMessageResponse userMessage = new ChatMessageResponse(
                UUID.randomUUID().toString(),
                "user",
                request.getMessage(),
                request.getRequestedFeatures(),
                null,
                LocalDateTime.now().toString()
        );

        // 봇 응답 메시지 기록
        ChatMessageResponse botMessage = new ChatMessageResponse(
                UUID.randomUUID().toString(),
                "bot",
                answer,
                List.of("chat"),    // 임시 값
                List.of(answer),    // 임시 값
                LocalDateTime.now().toString()
        );

        sessions.computeIfAbsent(sessionId, k -> new ArrayList<>()).add(userMessage);
        sessions.get(sessionId).add(botMessage);

        return botMessage;
    }

    @Override
    public List<ChatMessageResponse> getChatHistory(String sessionId) {
        return sessions.getOrDefault(sessionId, List.of());
    }

    @Override
    public ChatEndResponse endSession(String sessionId) {
        sessions.remove(sessionId);
        return new ChatEndResponse(sessionId, "ENDED");
    }
}
