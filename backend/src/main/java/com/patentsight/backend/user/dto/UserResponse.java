package com.patentsight.backend.user.dto;

public record UserResponse(
        Long user_id,
        String username,
        String role
) {}
