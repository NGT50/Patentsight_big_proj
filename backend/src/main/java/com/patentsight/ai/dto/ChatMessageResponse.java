package com.patentsight.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String messageId;
    private String sender;             // user / bot
    private String content;            // 메시지 내용
    private List<String> executedFeatures;
    private List<String> featuresResult;
    private String createdAt;
}
