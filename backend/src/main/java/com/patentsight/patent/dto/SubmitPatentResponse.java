package com.patentsight.patent.dto;

import com.patentsight.patent.domain.PatentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitPatentResponse {
    private Long patentId;
    private Long applicantId;
    private PatentStatus status;
    private String applicationNumber;
    private String ipcCode;
    private String applicantName;
}
