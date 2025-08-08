package com.patentsight.ai.service;

import com.patentsight.ai.dto.ValidationResultResponse;

import java.util.List;

public interface ValidationService {
    List<ValidationResultResponse> validatePatent(Long patentId);
}
