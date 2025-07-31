package com.patentsight.backend.service;

import com.patentsight.backend.model.Patent;
import com.patentsight.backend.repository.PatentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatentService {

    private final PatentRepository patentRepository;

    public PatentService(PatentRepository patentRepository) {
        this.patentRepository = patentRepository;
    }

    // 특허 등록
    public Patent createPatent(Patent patent) {
        return patentRepository.save(patent);
    }

    // 모든 특허 조회
    public List<Patent> getAllPatents() {
        return patentRepository.findAll();
    }
}
