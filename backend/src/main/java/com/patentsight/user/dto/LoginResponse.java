package com.patentsight.user.dto;

public record LoginResponse(String token, Long userId, String username, String role) {}