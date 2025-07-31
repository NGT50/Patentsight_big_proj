package com.patentsight.backend.controller;

import com.patentsight.backend.model.Patent;
import com.patentsight.backend.service.PatentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patents")
public class PatentController {

    private final PatentService patentService;

    public PatentController(PatentService patentService) {
        this.patentService = patentService;
    }

    // POST: 특허 등록
    @PostMapping
    public Patent createPatent(@RequestBody Patent patent) {
        return patentService.createPatent(patent);
    }

    // GET: 특허 전체 조회
    @GetMapping
    public List<Patent> getAllPatents() {
        return patentService.getAllPatents();
    }
}
