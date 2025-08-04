package com.patentsight.patent.controller;

import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.service.PatentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patents")
public class PatentController {

    private final PatentService patentService;

    public PatentController(PatentService patentService) {
        this.patentService = patentService;
    }

    @PostMapping
    public ResponseEntity<PatentResponse> createPatent(@RequestBody PatentRequest request) {
        // applicantId should come from auth context; using dummy 1L for example
        PatentResponse response = patentService.createPatent(request, 1L);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatentResponse> getPatent(@PathVariable("id") Long id) {
        PatentResponse res = patentService.getPatentDetail(id);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/my")
    public ResponseEntity<List<PatentResponse>> getMyPatents() {
        List<PatentResponse> list = patentService.getMyPatents(1L);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<PatentResponse> submit(@PathVariable("id") Long id) {
        PatentResponse res = patentService.submitPatent(id);
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PatentResponse> updateStatus(@PathVariable("id") Long id,
                                                       @RequestBody PatentStatus status) {
        PatentResponse res = patentService.updatePatentStatus(id, status);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatentResponse> updatePatent(@PathVariable("id") Long id,
                                                       @RequestBody PatentRequest request) {
        PatentResponse res = patentService.updatePatent(id, request);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatent(@PathVariable("id") Long id) {
        boolean deleted = patentService.deletePatent(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
