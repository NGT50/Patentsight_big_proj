package com.patentsight.user.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum DepartmentType {
    PATENT,     // 특허·실용신안
    DESIGN,     // 디자인
    TRADEMARK;  // 상표

    @JsonCreator
    public static DepartmentType from(String value) {
        if (value == null) {
            throw new IllegalArgumentException("DepartmentType cannot be null");
        }

        return switch (value.trim().toUpperCase()) {
            case "PATENT", "특허", "실용신안" -> PATENT;
            case "DESIGN", "디자인" -> DESIGN;
            case "TRADEMARK", "상표" -> TRADEMARK;
            default -> throw new IllegalArgumentException("Unknown department: " + value);
        };
    }
}
