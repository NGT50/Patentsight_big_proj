package com.patentsight.ai.service;

import com.patentsight.ai.dto.ParsePdfResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ParseService {
    ParsePdfResponse parsePdf(MultipartFile file);
}
