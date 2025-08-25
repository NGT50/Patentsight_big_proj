package com.patentsight.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor       // 기본 생성자
@AllArgsConstructor      // 모든 필드 생성자
public class ChatSessionResponse {
    private String sessionId;
    private String status;
}
