package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.ActionLogResponse;
import com.patentsight.ai.service.ActionLogService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActionLogServiceMockImpl implements ActionLogService {

    @Override
    public List<ActionLogResponse> getActionLogs(String messageId) {
        return List.of(
                new ActionLogResponse("ACTION_1", "check", "input1", "output1", "SUCCESS", "2025-08-07T12:00:00"),
                new ActionLogResponse("ACTION_2", "search", "input2", "output2", "SUCCESS", "2025-08-07T12:01:00")
        );
    }
}
