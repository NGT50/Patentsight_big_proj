package com.patentsight.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictResponse {
    @JsonProperty("gpt_subclass_candidates")
    private List<String> gptSubclassCandidates;
    @JsonProperty("top_ipc_results")
    private List<IpcResult> topIpcResults;
}