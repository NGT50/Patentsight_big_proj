package com.patentsight.user.dto;

public record UserResponse(
        Long userId,
        String username,
        String role
) {}