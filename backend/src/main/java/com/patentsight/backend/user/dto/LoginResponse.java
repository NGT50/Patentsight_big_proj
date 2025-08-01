package com.patentsight.backend.user.dto;

public record LoginResponse(String token, Long user_id, String username, String role) {}
