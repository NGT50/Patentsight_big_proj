package com.patentsight.ai.controller;

import com.patentsight.ai.service.AiImageService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AiImageControllerTest {

    @Test
    void getGenerated3DModelReturnsBadRequestForInvalidId() {
        AiImageService service = mock(AiImageService.class);
        AiImageController controller = new AiImageController(service);

        ResponseEntity<?> response = controller.getGenerated3DModel("abc");

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid id: abc", response.getBody());
        verifyNoInteractions(service);
    }
}
