package com.patentsight.ai.controller;
 
import com.patentsight.ai.dto.ActionLogResponse;
import com.patentsight.ai.service.ActionLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiActionLogController {

    private final ActionLogService actionLogService;

    public AiActionLogController(ActionLogService actionLogService) {
        this.actionLogService = actionLogService;
    }

    @GetMapping("/actions")
    public ResponseEntity<List<ActionLogResponse>> getActionLogs(@RequestParam String messageId) {
        return ResponseEntity.ok(actionLogService.getActionLogs(messageId));
    }
}
