package com.patentsight.user.dto;

import java.time.LocalDate;

public record ApplicantSignupRequest(
        String username,
        String password,
        String name,
        LocalDate birthDate,
        String email
) {}