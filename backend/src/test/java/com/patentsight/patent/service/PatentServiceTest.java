package com.patentsight.patent.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.file.repository.SpecVersionRepository;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.domain.PatentType;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.repository.PatentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatentServiceTest {

    @Mock
    private PatentRepository patentRepository;

    @Mock
    private FileRepository fileRepository;

    @Mock
    private SpecVersionRepository specVersionRepository;

    @InjectMocks
    private PatentService patentService;

    @BeforeEach
    void setup() {
        patentService = new PatentService(patentRepository, fileRepository, specVersionRepository);
    }

    @Test
    void createPatent_setsDraftStatusAndPersists() {
        PatentRequest request = new PatentRequest();
        request.setTitle("My Patent");
        request.setType(PatentType.PATENT);

        when(patentRepository.save(any(Patent.class))).thenAnswer(invocation -> {
            Patent p = invocation.getArgument(0);
            p.setPatentId(1L);
            return p;
        });

        PatentResponse response = patentService.createPatent(request, 100L);

        assertEquals(1L, response.getPatentId());
        assertEquals(PatentStatus.DRAFT, response.getStatus());
        ArgumentCaptor<Patent> captor = ArgumentCaptor.forClass(Patent.class);
        verify(patentRepository).save(captor.capture());
        assertEquals("My Patent", captor.getValue().getTitle());
    }

    @Test
    void getPatentDetail_returnsAttachmentIds() {
        Patent patent = new Patent();
        patent.setPatentId(1L);
        patent.setTitle("Title");
        patent.setType(PatentType.PATENT);
        patent.setStatus(PatentStatus.DRAFT);
        when(patentRepository.findById(1L)).thenReturn(Optional.of(patent));

        FileAttachment file = new FileAttachment();
        file.setFileId(10L);
        file.setPatent(patent);
        when(fileRepository.findAll()).thenReturn(Collections.singletonList(file));

        PatentResponse res = patentService.getPatentDetail(1L);

        assertNotNull(res);
        assertEquals(1L, res.getPatentId());
        assertEquals(1, res.getAttachmentIds().size());
        assertEquals(10L, res.getAttachmentIds().get(0));
    }

    @Test
    void updatePatent_modifiesFields() {
        Patent existing = new Patent();
        existing.setPatentId(1L);
        existing.setTitle("Old");
        existing.setType(PatentType.PATENT);
        when(patentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(patentRepository.save(any(Patent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PatentRequest req = new PatentRequest();
        req.setTitle("New");
        req.setType(PatentType.TRADEMARK);

        PatentResponse res = patentService.updatePatent(1L, req);

        assertNotNull(res);
        assertEquals("New", res.getTitle());
        assertEquals(PatentType.TRADEMARK, res.getType());
    }

    @Test
    void deletePatent_removesRecord() {
        Patent patent = new Patent();
        patent.setPatentId(1L);
        when(patentRepository.findById(1L)).thenReturn(Optional.of(patent));

        boolean deleted = patentService.deletePatent(1L);

        assertTrue(deleted);
        verify(patentRepository).delete(patent);
    }
}

