package com.patentsight.review.dto;

import com.patentsight.review.domain.Review;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 출원 내용 + 심사 결과를 통합적으로 담는 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDetailResponse {

    // === [1] 고유 식별 정보 ===
    private Long reviewId;            // 심사 고유 ID
    private Long patentId;            // 특허 고유 ID

    // === [2] 출원 기본 정보 ===
    private String title;             // 발명 제목
    private String applicantName;     // 출원인 이름
    private String inventor;          // 발명자 이름
    private String applicationNumber; // 출원번호 또는 분류번호
    private LocalDate applicationDate;// 출원 접수일

    // === [3] 출원 기술 내용 ===
    private String technicalField;        // 기술분야 설명
    private String backgroundTechnology;  // 배경 기술 설명
    private String problemToSolve;        // 발명이 해결하려는 과제
    private String solution;              // 해결 수단
    private String effect;                // 발명의 효과
    private String summary;               // 발명 요약
    private String drawingDescription;    // 도면 간단 설명
    private List<String> drawings;        // 도면 이미지 목록 (URL)
    private List<String> claims;          // 청구항 목록
    private String applicationContent;    // 출원인이 작성한 전체 명세서 등

    // === [4] 분류 및 상태 정보 ===
    private String cpc;               // CPC 또는 IPC 코드
    private String reviewStatus;      // 심사 상태 (예: 심사 중, 승인 등)

    // === [5] 심사 결과 정보 ===
    private String examinerName;      // 심사관 이름
    private Review.Decision decision; // 심사 결과 (APPROVE, REJECT 등)
    private String comment;           // 심사관의 의견 또는 코멘트
    private LocalDateTime reviewedAt; // 심사 완료 일시
    private List<String> aiChecks;    // AI 자동 점검 결과 목록

}
