package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.ValidationResultResponse;
import com.patentsight.ai.service.ValidationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ValidationServiceMockImpl implements ValidationService {

    @Override
    public List<ValidationResultResponse> validatePatent(Long patentId) {
        return List.of(
                new ValidationResultResponse("ERROR_1", "청구항 1이 명확하지 않음"),
                new ValidationResultResponse("ERROR_2", "용어 정의가 누락됨")
        );
    }
}
