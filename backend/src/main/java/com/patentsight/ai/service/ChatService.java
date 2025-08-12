package com.patentsight.ai.service;

import com.patentsight.ai.dto.*;

import java.util.List;

public interface ChatService {

    ChatSessionResponse startSession(ChatSessionRequest request);

    ChatMessageResponse sendMessage(String sessionId, ChatMessageRequest request);

    List<ChatMessageResponse> getChatHistory(String sessionId);

    ChatEndResponse endSession(String sessionId);
}
