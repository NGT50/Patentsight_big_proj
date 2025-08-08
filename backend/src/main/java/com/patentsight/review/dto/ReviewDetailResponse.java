package com.patentsight.review.dto;

import com.patentsight.patent.domain.Patent;
import com.patentsight.review.domain.Review;
import com.patentsight.user.domain.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewDetailResponse {
    // API 명세서에 맞게 모든 필드를 추가합니다.
    private Long reviewId;
    private Long patentId;
    private String title;
    private String applicantName;
    private String inventor;
    private String applicationNumber;
    private String applicationDate;
    private String technicalField;
    private String backgroundTechnology;
    private String problemToSolve;
    private String solution;
    private String effect;
    private String summary;
    private String drawingDescription;
    private List<String> drawings; // 실제 파일 URL 목록이 될 수 있습니다.
    private List<String> claims;
    private String applicationContent; // 여러 필드를 조합한 요약 정보
    private String cpc;
    private String reviewStatus;
    private String examinerName;
    private Review.Decision decision;
    private String comment;
    private LocalDateTime reviewedAt;
    private List<String> aiChecks; // AI 점검 결과

    // 생성자 또는 정적 팩토리 메소드를 사용하여 엔티티를 DTO로 변환합니다.
    public static ReviewDetailResponse from(Review review, User applicant) {
        Patent patent = review.getPatent();
        
        // applicationContent 필드를 생성하기 위해 여러 필드를 조합합니다.
        String content = String.format(
            "기술분야: %s\n배경기술: %s\n해결 과제: %s\n해결 수단: %s\n기대 효과: %s\n도면 설명: %s\n요약: %s\n청구항 수: %d개",
            patent.getTechnicalField(),
            patent.getBackgroundTechnology(),
            patent.getProblemToSolve(),
            patent.getSolution(),
            patent.getEffect(),
            patent.getDrawingDescription(),
            patent.getSummary(),
            patent.getClaims() != null ? patent.getClaims().size() : 0
        );

        return ReviewDetailResponse.builder()
                .reviewId(review.getReviewId())
                .patentId(patent.getPatentId())
                .title(patent.getTitle())
                .applicantName(applicant.getName()) // 조회해온 출원인 이름 사용
                .inventor(patent.getInventor())
                .applicationNumber(patent.getApplicationNumber())
                .applicationDate(patent.getSubmittedAt().toLocalDate().toString()) // 날짜 형식으로 변환
                .technicalField(patent.getTechnicalField())
                .backgroundTechnology(patent.getBackgroundTechnology())
                .problemToSolve(patent.getProblemToSolve())
                .solution(patent.getSolution())
                .effect(patent.getEffect())
                .summary(patent.getSummary())
                .drawingDescription(patent.getDrawingDescription())
                .drawings(null) // TODO: 파일 목록 조회 로직 추가 필요
                .claims(patent.getClaims())
                .applicationContent(content)
                .cpc(patent.getCpc())
                .reviewStatus(patent.getStatus().name())
                .examinerName(review.getExaminer().getName())
                .decision(review.getDecision())
                .comment(review.getComment())
                .reviewedAt(review.getReviewedAt())
                .aiChecks(List.of()) // TODO: AI 점검 결과 연결
                .build();
    }
}