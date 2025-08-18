package com.patentsight.backend.controller;

import com.patentsight.backend.service.AuthService;
import com.patentsight.backend.service.AuthService.VerificationResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void verifySuccess() throws Exception {
        when(authService.verify("good"))
                .thenReturn(VerificationResult.SUCCESS);

        mockMvc.perform(post("/api/examiner/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"good\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void verifyUnauthorized() throws Exception {
        when(authService.verify("bad"))
                .thenReturn(VerificationResult.UNAUTHORIZED);

        mockMvc.perform(post("/api/examiner/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"bad\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void verifyForbidden() throws Exception {
        when(authService.verify("forbidden"))
                .thenReturn(VerificationResult.FORBIDDEN);

        mockMvc.perform(post("/api/examiner/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"forbidden\"}"))
                .andExpect(status().isForbidden());
    }
}
