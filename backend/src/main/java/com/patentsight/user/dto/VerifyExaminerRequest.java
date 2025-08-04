package com.patentsight.user.dto;

// 🔹 심사관 코드 인증 요청 DTO
public record VerifyExaminerRequest(String auth_code) {}