package com.patentsight.patent.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.file.repository.SpecVersionRepository;
import com.patentsight.file.service.SpecVersionService;
import com.patentsight.notification.service.NotificationService;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.domain.PatentType;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.dto.SubmitPatentResponse;
import com.patentsight.patent.repository.PatentRepository;
import com.patentsight.review.service.ReviewService;
import com.patentsight.user.domain.User;
import com.patentsight.user.repository.UserRepository;
import org.springframework.web.client.RestTemplate;
import com.patentsight.ai.dto.PredictResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
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

    @Mock
    private SpecVersionService specVersionService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ReviewService reviewService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PatentService patentService;

    @Test
    void createPatent_setsFieldsAndAttachments() {
        PatentRequest request = new PatentRequest();
        request.setTitle("My Patent");
        request.setType(PatentType.PATENT);
        request.setCpc("B62H1/00");
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

        when(patentRepository.save(any(Patent.class))).thenAnswer(invocation -> {
            Patent p = invocation.getArgument(0);
            p.setPatentId(1L);
            return p;
        });

        PatentResponse response = patentService.createPatent(request, 100L);

        assertEquals(1L, response.getPatentId());
        assertEquals(100L, response.getApplicantId());
        assertEquals(PatentStatus.DRAFT, response.getStatus());
        assertEquals("My Patent", response.getTitle());
        assertEquals(PatentType.PATENT, response.getType());
        assertEquals("B62H1/00", response.getCpc());
        assertNull(response.getApplicationNumber());
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
    }

    @Test
    void getPatentDetail_returnsAttachmentIds() {
        Patent patent = new Patent();
        patent.setPatentId(1L);
        patent.setApplicantId(100L);
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
        assertEquals(100L, res.getApplicantId());
        assertEquals(1, res.getAttachmentIds().size());
        assertEquals(10L, res.getAttachmentIds().get(0));
        assertEquals("B62H1/00", res.getCpc());
    }

    @Test
    void updatePatent_modifiesFields() {
        Patent existing = new Patent();
        existing.setPatentId(1L);
        existing.setApplicantId(100L);
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
        assertEquals(100L, res.getApplicantId());
    }

    @Test
    void submitPatent_assignsApplicationNumber() {
        Patent patent = new Patent();
        patent.setPatentId(1L);
        patent.setApplicantId(100L);
        patent.setType(PatentType.PATENT);
        when(patentRepository.findById(1L)).thenReturn(Optional.of(patent));
        when(patentRepository.save(any(Patent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(restTemplate.postForObject(any(), any(), eq(PredictResponse.class))).thenReturn(null);
        doNothing().when(reviewService).autoAssignWithSpecialty(any(Patent.class));
        User user100 = new User();
        user100.setUserId(100L);
        user100.setName("User100");
        when(userRepository.findById(100L)).thenReturn(Optional.of(user100));

        SubmitPatentResponse res = patentService.submitPatent(1L, null, 100L);

        assertNotNull(res);
        assertEquals(PatentStatus.SUBMITTED, res.getStatus());
        assertEquals(100L, res.getApplicantId());
        assertNotNull(res.getApplicationNumber());
        String expectedPrefix = "10" + java.time.LocalDate.now().getYear();
        assertTrue(res.getApplicationNumber().startsWith(expectedPrefix));
        assertEquals(13, res.getApplicationNumber().length());
    }

    @Test
    void submitPatent_assignsApplicationNumberForUtilityModel() {
        Patent patent = new Patent();
        patent.setPatentId(2L);
        patent.setApplicantId(200L);
        patent.setType(PatentType.UTILITY_MODEL);
        when(patentRepository.findById(2L)).thenReturn(Optional.of(patent));
        when(patentRepository.save(any(Patent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(restTemplate.postForObject(any(), any(), eq(PredictResponse.class))).thenReturn(null);
        doNothing().when(reviewService).autoAssignWithSpecialty(any(Patent.class));
        User user200 = new User();
        user200.setUserId(200L);
        user200.setName("User200");
        when(userRepository.findById(200L)).thenReturn(Optional.of(user200));

        SubmitPatentResponse res = patentService.submitPatent(2L, null, 200L);

        assertNotNull(res);
        assertEquals(200L, res.getApplicantId());
        String expectedPrefix = "20" + java.time.LocalDate.now().getYear();
        assertTrue(res.getApplicationNumber().startsWith(expectedPrefix));
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

    @Test
    void getMyPatents_populatesFields() {
        Patent patent = new Patent();
        patent.setPatentId(1L);
        patent.setApplicantId(1L);
        patent.setTitle("T");
        patent.setType(PatentType.PATENT);
        patent.setStatus(PatentStatus.DRAFT);
        patent.setSubmittedAt(LocalDateTime.of(2024, 1, 1, 0, 0));
        when(patentRepository.findByApplicantId(1L)).thenReturn(Collections.singletonList(patent));

        FileAttachment file = new FileAttachment();
        file.setFileId(10L);
        file.setPatent(patent);
        when(fileRepository.findAll()).thenReturn(Collections.singletonList(file));

        List<PatentResponse> list = patentService.getMyPatents(1L);
        assertEquals(1, list.size());
        PatentResponse res = list.get(0);
        assertEquals(PatentType.PATENT, res.getType());
        assertEquals(List.of(10L), res.getAttachmentIds());
        assertEquals(LocalDate.of(2024, 1, 1), res.getApplicationDate());
    }
}

