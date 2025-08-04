package com.patentsight.user.dto;

import java.time.LocalDate;
import com.patentsight.user.domain.DepartmentType;

public record ExaminerSignupRequest(
        String username,
        String password,
        String name,
        LocalDate birthDate,
        DepartmentType department   // enum 타입으로 받음
) {}