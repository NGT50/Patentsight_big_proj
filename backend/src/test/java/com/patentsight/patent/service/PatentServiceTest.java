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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
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
    void createPatent_setsFieldsAndAttachments() {
        PatentRequest request = new PatentRequest();
        request.setTitle("My Patent");
        request.setType(PatentType.PATENT);
        request.setFileIds(Arrays.asList(10L, 20L));
        request.setCpc("B62H1/00");
        request.setApplicationNumber("1020240001234");
        request.setInventor("홍길동");
        request.setTechnicalField("자전거 잠금장치 관련 기술");
        request.setBackgroundTechnology("기존 자물쇠 방식은 위치 감지가 어렵고 분실 위험이 있음.");
        PatentRequest.InventionDetails details = new PatentRequest.InventionDetails();
        details.setProblemToSolve("스마트폰과 연동 가능한 자전거 잠금장치 부재");
        details.setSolution("BLE 기반 잠금장치 및 위치 추적 모듈 개발");
        details.setEffect("도난 방지와 위치 추적이 동시에 가능");
        request.setInventionDetails(details);
        request.setSummary("본 발명은 BLE 통신 기반의 스마트 자전거 잠금장치에 관한 것이다.");
        request.setDrawingDescription("도 1은 잠금장치의 회로 구성도이다.");
        request.setClaims(Arrays.asList(
                "BLE 통신 모듈을 포함하는 자전거 잠금장치",
                "상기 잠금장치가 GPS 모듈과 통신 가능한 것을 특징으로 하는 시스템"));

        FileAttachment file1 = new FileAttachment();
        file1.setFileId(10L);
        FileAttachment file2 = new FileAttachment();
        file2.setFileId(20L);
        when(fileRepository.findAllById(Arrays.asList(10L, 20L))).thenReturn(Arrays.asList(file1, file2));
        when(fileRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        when(patentRepository.save(any(Patent.class))).thenAnswer(invocation -> {
            Patent p = invocation.getArgument(0);
            p.setPatentId(1L);
            return p;
        });

        PatentResponse response = patentService.createPatent(request, 100L);

        assertEquals(1L, response.getPatentId());
        assertEquals(PatentStatus.DRAFT, response.getStatus());
        assertEquals("My Patent", response.getTitle());
        assertEquals(PatentType.PATENT, response.getType());
        assertEquals(Arrays.asList(10L, 20L), response.getAttachmentIds());
        assertEquals("B62H1/00", response.getCpc());
        assertEquals("1020240001234", response.getApplicationNumber());
        assertEquals("홍길동", response.getInventor());
        assertEquals("자전거 잠금장치 관련 기술", response.getTechnicalField());
        assertEquals("기존 자물쇠 방식은 위치 감지가 어렵고 분실 위험이 있음.", response.getBackgroundTechnology());
        assertNotNull(response.getInventionDetails());
        assertEquals("스마트폰과 연동 가능한 자전거 잠금장치 부재", response.getInventionDetails().getProblemToSolve());
        assertEquals("BLE 기반 잠금장치 및 위치 추적 모듈 개발", response.getInventionDetails().getSolution());
        assertEquals("도난 방지와 위치 추적이 동시에 가능", response.getInventionDetails().getEffect());
        assertEquals("본 발명은 BLE 통신 기반의 스마트 자전거 잠금장치에 관한 것이다.", response.getSummary());
        assertEquals("도 1은 잠금장치의 회로 구성도이다.", response.getDrawingDescription());
        assertEquals(2, response.getClaims().size());
        assertNotNull(file1.getPatent());
        assertEquals(1L, file1.getPatent().getPatentId());
    }

    @Test
    void getPatentDetail_returnsAttachmentIds() {
        Patent patent = new Patent();
        patent.setPatentId(1L);
        patent.setTitle("Title");
        patent.setType(PatentType.PATENT);
        patent.setStatus(PatentStatus.DRAFT);
        patent.setCpc("B62H1/00");
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
        assertEquals("B62H1/00", res.getCpc());
    }

    @Test
    void updatePatent_modifiesFields() {
        Patent existing = new Patent();
        existing.setPatentId(1L);
        existing.setTitle("Old");
        existing.setType(PatentType.PATENT);
        existing.setCpc("OLD");
        when(patentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(patentRepository.save(any(Patent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PatentRequest req = new PatentRequest();
        req.setTitle("New");
        req.setType(PatentType.TRADEMARK);
        req.setCpc("NEW");

        PatentResponse res = patentService.updatePatent(1L, req);

        assertNotNull(res);
        assertEquals("New", res.getTitle());
        assertEquals(PatentType.TRADEMARK, res.getType());
        assertEquals("NEW", res.getCpc());
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

