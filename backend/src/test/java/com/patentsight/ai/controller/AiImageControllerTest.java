package com.patentsight.ai.controller;

import com.patentsight.ai.service.AiImageService;
import com.patentsight.file.service.FileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiImageController.class)
class AiImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiImageService aiImageService;

    @MockBean
    private FileService fileService;

    @Test
    void getGenerated3DModelReturnsBadRequestForInvalidId() throws Exception {
        when(fileService.get(999L)).thenReturn(null);

        mockMvc.perform(get("/api/ai/3d-models/999"))
                .andExpect(status().isBadRequest());
    }
}



