package com.patentsight.ai.service;

import com.patentsight.ai.dto.ActionLogResponse;

import java.util.List;

public interface ActionLogService {
    List<ActionLogResponse> getActionLogs(String messageId);
}
