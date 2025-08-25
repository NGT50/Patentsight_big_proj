package com.patentsight.ai.service.impl;

import com.patentsight.ai.dto.ParsePdfResponse;
import com.patentsight.ai.parser.PatentPdfParser;
import com.patentsight.ai.service.ParseService;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ParseServiceImpl implements ParseService {

    @Override
    public ParsePdfResponse parsePdf(MultipartFile file) {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {

            // [중요 옵션] 좌표 정렬/단어 구분/개행 통일
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            stripper.setWordSeparator(" ");
            stripper.setLineSeparator("\n");

            String raw = stripper.getText(document);

            // 1. 전처리
            String text = PatentPdfParser.preprocess(raw);

            // 2. 업그레이드된 파서로 섹션 파싱
            return PatentPdfParser.parse(text);

        } catch (IOException e) {
            throw new RuntimeException("PDF 파싱 중 오류", e);
        }
    }
}