package com.patentsight.patent.service;

import com.patentsight.user.repository.UserRepository;
import com.patentsight.user.domain.User;
import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.domain.SpecVersion;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patentsight.file.dto.DocumentContentResponse;
import com.patentsight.file.dto.DocumentVersionRequest;
import com.patentsight.file.dto.FileVersionInfoRequest;
import com.patentsight.file.dto.FileVersionResponse;
import com.patentsight.file.dto.RestoreVersionResponse;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.file.repository.SpecVersionRepository;
import com.patentsight.file.service.SpecVersionService;
import com.patentsight.patent.domain.Patent;
import com.patentsight.review.service.ReviewService;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.dto.SubmitPatentResponse;
import com.patentsight.ai.dto.PredictRequest;
import com.patentsight.ai.dto.PredictResponse;
import com.patentsight.patent.repository.PatentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.patentsight.notification.service.NotificationService;
import com.patentsight.notification.dto.NotificationRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatentService {

    private static final Logger log = LoggerFactory.getLogger(PatentService.class);

    private final PatentRepository patentRepository;
    private final ReviewService reviewService;
    private final FileRepository fileRepository;
    private final SpecVersionRepository specVersionRepository;
    private final SpecVersionService specVersionService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;

    @Value("${external-api.fastapi-ipc-url}")
    private String fastApiIpcUrl;

    private final NotificationService notificationService;

    public PatentService(PatentRepository patentRepository,
                         FileRepository fileRepository,
                         SpecVersionRepository specVersionRepository,
                         SpecVersionService specVersionService,
                         RestTemplate restTemplate,
                         NotificationService notificationService,
                         ReviewService reviewService,
                         UserRepository userRepository) {
        this.patentRepository = patentRepository;
        this.fileRepository = fileRepository;
        this.specVersionRepository = specVersionRepository;
        this.specVersionService = specVersionService;
        this.restTemplate = restTemplate;
        this.notificationService = notificationService;
        this.reviewService = reviewService;
        this.userRepository = userRepository;   // 👈 추가

    }

    // ------------------- CREATE -------------------
    public PatentResponse createPatent(PatentRequest request, Long applicantId) {
        Patent patent = new Patent();
        patent.setTitle(request.getTitle());
        patent.setType(request.getType());
        patent.setApplicantId(applicantId);
        patent.setStatus(PatentStatus.DRAFT);
        // DB에서는 CPC 코드가 NOT NULL 제약을 가질 수 있으므로
        // null이 전달되면 빈 문자열로 치환하여 저장한다.
        patent.setCpc(request.getCpc() != null ? request.getCpc() : "");
        patent.setTechnicalField(request.getTechnicalField());
        patent.setBackgroundTechnology(request.getBackgroundTechnology());

        if (request.getInventor() != null && !request.getInventor().isBlank()) {
            patent.setInventor(request.getInventor());
        } else {
            // inventor가 비어있으면 자동으로 User.name 넣기
            String userName = userRepository.findById(applicantId)
                    .map(user -> user.getName())
                    .orElse("미지정");
            patent.setInventor(userName);
        }
    
        if (request.getInventionDetails() != null) {
            patent.setProblemToSolve(request.getInventionDetails().getProblemToSolve());
            patent.setSolution(request.getInventionDetails().getSolution());
            patent.setEffect(request.getInventionDetails().getEffect());
        }
    
        patent.setSummary(request.getSummary());
        patent.setDrawingDescription(request.getDrawingDescription());
        patent.setClaims(request.getClaims());
    
        log.info("[CREATE] Before save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        try {
            // save 후 flush → patentId 확정 보장
            patentRepository.saveAndFlush(patent);
            log.info("[CREATE] After save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        } catch (Exception e) {
            log.error("[CREATE] Error saving patent - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus(), e);
            throw e;
        }
    
        // 알림
        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(applicantId)
                        .notificationType("PATENT_CREATED")
                        .message("새로운 특허가 등록되었습니다: " + patent.getTitle())
                        .targetType("PATENT")
                        .targetId(patent.getPatentId())
                        .build()
        );
    
        List<FileAttachment> attachments = java.util.Collections.emptyList();
    
        PatentResponse response = toPatentResponse(patent, attachments);
    
        // ---- SpecVersion 저장 ----
        try {
            SpecVersion initial = new SpecVersion();
            initial.setPatent(patent);
            initial.setApplicantId(applicantId);
            initial.setChangeSummary("initial draft");
    
            try {
                initial.setDocument(objectMapper.writeValueAsString(response));
            } catch (Exception e) {
                log.warn("[CREATE] JSON 변환 실패, 빈 JSON 저장", e);
                initial.setDocument("{}");
            }
    
            initial.setVersionNo(1);
            initial.setCurrent(true);
            LocalDateTime now = LocalDateTime.now();
            initial.setCreatedAt(now);
            initial.setUpdatedAt(now);
    
            specVersionService.save(initial);
            log.info("[CREATE] Initial SpecVersion 저장 완료 - patentId: {}", patent.getPatentId());
    
        } catch (Exception e) {
            log.error("[CREATE] SpecVersion 생성 실패 - patentId={}", patent.getPatentId(), e);
            throw e; // rollback → 불완전한 데이터 방지
        }
    
        return response;
    }


    // ------------------- READ -------------------
    @Transactional(readOnly = true)
    public PatentResponse getPatentDetail(Long patentId) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;
        return toPatentResponse(patent, null);
    }

    @Transactional(readOnly = true)
    public List<PatentResponse> getMyPatents(Long applicantId) {
        return patentRepository.findByApplicantId(applicantId).stream()
                .map(p -> toPatentResponse(p, null))
                .collect(Collectors.toList());
    }

    // ------------------- SUBMIT -------------------
    public SubmitPatentResponse submitPatent(Long patentId, PatentRequest latestRequest) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;

        // ✅ 최신 데이터가 들어온 경우 DB 업데이트 (임시저장용 updatePatent → 제출 전용 updatePatentForSubmit으로 변경)
        if (latestRequest != null) {
            patent = updatePatentForSubmit(patentId, latestRequest);  // ★ 수정됨
        }

        // FastAPI 호출
        String firstClaim = patent.getClaims() != null && !patent.getClaims().isEmpty()
                ? patent.getClaims().get(0) : "";
        PredictRequest requestBody = new PredictRequest(firstClaim);

        String ipcCode = "N/A";
        try {
            PredictResponse predictResponse = restTemplate.postForObject(fastApiIpcUrl, requestBody, PredictResponse.class);
            if (predictResponse != null && !predictResponse.getTopIpcResults().isEmpty()) {
                ipcCode = predictResponse.getTopIpcResults().get(0).getMaingroup();
            }
        } catch (Exception e) {
            log.error("Failed to retrieve IPC code from FastAPI", e);
            ipcCode = "N/A";
        }

        // 특허 상태 및 IPC 업데이트
        patent.setStatus(PatentStatus.SUBMITTED);
        patent.setSubmittedAt(LocalDateTime.now());
        if (patent.getApplicationNumber() == null) {
            patent.setApplicationNumber(generateApplicationNumber(patent));
        }
        patent.setIpc(ipcCode);

        log.info("[SUBMIT] Before save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        try {
            patentRepository.save(patent);
            log.info("[SUBMIT] After save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        } catch (Exception e) {
            log.error("[SUBMIT] Error saving patent - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus(), e);
            throw e;
        }

        // 심사관 자동 할당
        reviewService.autoAssignWithSpecialty(patent);

        // 알림
        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(patent.getApplicantId())
                        .notificationType("PATENT_SUBMITTED")
                        .message("특허가 제출되었습니다: " + patent.getTitle())
                        .targetType("PATENT")
                        .targetId(patent.getPatentId())
                        .build()
        );

        return new SubmitPatentResponse(
                patent.getPatentId(),
                patent.getApplicantId(),
                patent.getStatus(),
                patent.getApplicationNumber(),
                patent.getIpc()
        );
    }

    private String generateApplicationNumber(Patent patent) {
        String typeCode;
        switch (patent.getType()) {
            case PATENT -> typeCode = "10";
            case UTILITY_MODEL -> typeCode = "20";
            case DESIGN -> typeCode = "30";
            case TRADEMARK -> typeCode = "40";
            default -> typeCode = "10";
        }
        String year = String.valueOf(LocalDate.now().getYear());
        String prefix = typeCode + year;

        String maxAppNo = patentRepository.findMaxApplicationNumberWithPrefix(prefix);
        long nextSerial = 1L;
        if (maxAppNo != null && maxAppNo.length() >= prefix.length()) {
            String serialPart = maxAppNo.substring(prefix.length());
            try {
                nextSerial = Long.parseLong(serialPart) + 1;
            } catch (NumberFormatException ignored) {
            }
        }
        String serial = String.format("%07d", nextSerial);
        return prefix + serial;
    }

    // ------------------- UPDATE -------------------

    // (1) 상태 변경
    public PatentResponse updatePatentStatus(Long patentId, PatentStatus status) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;
        patent.setStatus(status);

        log.info("[STATUS] Before save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        try {
            patentRepository.save(patent);
            log.info("[STATUS] After save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        } catch (Exception e) {
            log.error("[STATUS] Error saving patent - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus(), e);
            throw e;
        }

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(patent.getApplicantId())
                        .notificationType("PATENT_STATUS_CHANGED")
                        .message("특허 상태가 변경되었습니다: " + status)
                        .targetType("PATENT")
                        .targetId(patent.getPatentId())
                        .build()
        );

        PatentResponse res = new PatentResponse();
        res.setPatentId(patent.getPatentId());
        res.setApplicantId(patent.getApplicantId());
        res.setStatus(patent.getStatus());
        return res;
    }

    // (2) 임시저장 전용 업데이트 (status 유지)
    public PatentResponse updatePatent(Long patentId, PatentRequest request) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;

        if (request.getTitle() != null) patent.setTitle(request.getTitle());
        if (request.getType() != null) patent.setType(request.getType());
        if (request.getCpc() != null) patent.setCpc(request.getCpc());
        if (request.getInventor() != null) patent.setInventor(request.getInventor());
        if (request.getTechnicalField() != null) patent.setTechnicalField(request.getTechnicalField());
        if (request.getBackgroundTechnology() != null) patent.setBackgroundTechnology(request.getBackgroundTechnology());

        if (request.getInventionDetails() != null) {
            PatentRequest.InventionDetails d = request.getInventionDetails();
            if (d.getProblemToSolve() != null) patent.setProblemToSolve(d.getProblemToSolve());
            if (d.getSolution() != null) patent.setSolution(d.getSolution());
            if (d.getEffect() != null) patent.setEffect(d.getEffect());
        }

        if (request.getSummary() != null) patent.setSummary(request.getSummary());
        if (request.getDrawingDescription() != null) patent.setDrawingDescription(request.getDrawingDescription());
        if (request.getClaims() != null) patent.setClaims(request.getClaims());

        log.info("[UPDATE] Before save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        try {
            patentRepository.save(patent);
            log.info("[UPDATE] After save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        } catch (Exception e) {
            log.error("[UPDATE] Error saving patent - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus(), e);
            throw e;
        }

        return toPatentResponse(patent, null);
    }

    // (3) 최종 제출 전용 업데이트 (status = SUBMITTED)
    private Patent updatePatentForSubmit(Long patentId, PatentRequest request) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;

        if (request.getTitle() != null) patent.setTitle(request.getTitle());
        if (request.getType() != null) patent.setType(request.getType());
        if (request.getCpc() != null) patent.setCpc(request.getCpc());
        if (request.getInventor() != null) patent.setInventor(request.getInventor());
        if (request.getTechnicalField() != null) patent.setTechnicalField(request.getTechnicalField());
        if (request.getBackgroundTechnology() != null) patent.setBackgroundTechnology(request.getBackgroundTechnology());

        if (request.getInventionDetails() != null) {
            PatentRequest.InventionDetails d = request.getInventionDetails();
            if (d.getProblemToSolve() != null) patent.setProblemToSolve(d.getProblemToSolve());
            if (d.getSolution() != null) patent.setSolution(d.getSolution());
            if (d.getEffect() != null) patent.setEffect(d.getEffect());
        }

        if (request.getSummary() != null) patent.setSummary(request.getSummary());
        if (request.getDrawingDescription() != null) patent.setDrawingDescription(request.getDrawingDescription());
        if (request.getClaims() != null) patent.setClaims(request.getClaims());

        // ★ 최종 제출 시 상태 SUBMITTED 강제
        patent.setStatus(PatentStatus.SUBMITTED);

        log.info("[SUBMIT_UPDATE] Before save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        try {
            patentRepository.save(patent);
            log.info("[SUBMIT_UPDATE] After save - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus());
        } catch (Exception e) {
            log.error("[SUBMIT_UPDATE] Error saving patent - patentId: {}, status: {}", patent.getPatentId(), patent.getStatus(), e);
            throw e;
        }

        // ★ 제출 시점 버전 기록
        SpecVersion version = new SpecVersion();
        version.setPatent(patent);
        version.setApplicantId(patent.getApplicantId());
        version.setChangeSummary("Submitted version");
        try {
            version.setDocument(objectMapper.writeValueAsString(toPatentResponse(patent, null)));
        } catch (Exception e) {
            version.setDocument(null);
        }
        version.setVersionNo(1); // 필요 시 기존 로직대로 계산 가능
        version.setCurrent(true);
        version.setCreatedAt(LocalDateTime.now());
        version.setUpdatedAt(LocalDateTime.now());

        try {
            specVersionService.save(version);
        } catch (Exception e) {
            // log and continue
        }


        return patent;
    }

    // ✅ 빠져있던 updateDocument 추가 (임시저장)
    public DocumentContentResponse updateDocument(Long patentId, PatentRequest document) {
        PatentResponse updated = updatePatent(patentId, document);
        if (updated == null) return null;

        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;

        SpecVersion current = specVersionRepository.findFirstByPatent_PatentIdAndIsCurrentTrue(patentId);
        if (current == null) {
            current = new SpecVersion();
            current.setPatent(patent);
            current.setVersionNo(1);
            current.setApplicantId(patent.getApplicantId());
            current.setCurrent(true);
            current.setCreatedAt(LocalDateTime.now());
        }
        try {
            current.setDocument(objectMapper.writeValueAsString(updated));
        } catch (Exception e) {
            current.setDocument(null);
        }
        current.setUpdatedAt(LocalDateTime.now());

        try {
            specVersionService.save(current);
        } catch (Exception e) {
            // log and continue
        }


        DocumentContentResponse res = new DocumentContentResponse();
        res.setVersionNo(current.getVersionNo());
        res.setDocument(updated);
        res.setUpdatedAt(current.getUpdatedAt());
        return res;
    }

    // ------------------- DELETE -------------------
    public boolean deletePatent(Long patentId) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return false;

        Long userId = patent.getApplicantId();
        String title = patent.getTitle();
        Long targetId = patent.getPatentId();

        notificationService.createNotification(
                NotificationRequest.builder()
                        .userId(userId)
                        .notificationType("PATENT_DELETED")
                        .message("특허가 삭제되었습니다: " + title)
                        .targetType("PATENT")
                        .targetId(targetId)
                        .build()
        );

        patentRepository.delete(patent);
        return true;
    }

    // ------------------- VERSION 관리 -------------------
    @Transactional(readOnly = true)
    public List<FileVersionResponse> getDocumentVersions(Long patentId) {
        List<SpecVersion> versions = specVersionRepository.findByPatent_PatentIdOrderByVersionNoDesc(patentId);
        return versions.stream().map(this::toFileVersionResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentContentResponse getLatestDocument(Long patentId) {
        SpecVersion latest = specVersionRepository.findFirstByPatent_PatentIdAndIsCurrentTrue(patentId);
        if (latest == null) return null;

        DocumentContentResponse res = new DocumentContentResponse();
        res.setVersionNo(latest.getVersionNo());
        try {
            PatentResponse doc = objectMapper.readValue(latest.getDocument(), PatentResponse.class);
            res.setDocument(doc);
        } catch (Exception e) {
            res.setDocument(null);
        }
        res.setUpdatedAt(latest.getUpdatedAt());
        return res;
    }

    public FileVersionResponse createDocumentVersion(Long patentId, DocumentVersionRequest request) {
        PatentResponse updated = updatePatent(patentId, request.getNewDocument());
        if (updated == null) return null;

        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;

        List<SpecVersion> existing = specVersionRepository.findByPatent_PatentIdOrderByVersionNoDesc(patentId);
        for (SpecVersion v : existing) {
            v.setCurrent(false);
        }

        try {
            specVersionService.saveAll(existing);
        } catch (Exception e) {
            // log and continue
        }


        SpecVersion version = new SpecVersion();
        version.setPatent(patent);
        version.setApplicantId(request.getApplicantId());
        version.setChangeSummary(request.getChangeSummary());
        try {
            version.setDocument(objectMapper.writeValueAsString(updated));
        } catch (Exception e) {
            version.setDocument(null);
        }
        int nextNo = existing.isEmpty() ? 1 : existing.get(0).getVersionNo() + 1;
        version.setVersionNo(nextNo);
        version.setCurrent(true);
        version.setCreatedAt(LocalDateTime.now());
        version.setUpdatedAt(LocalDateTime.now());

        try {
            specVersionService.save(version);
        } catch (Exception e) {
            // log and continue
        }


        return toFileVersionResponse(version);
    }

    public FileVersionResponse updateVersionInfo(Long versionId, FileVersionInfoRequest request) {
        SpecVersion version = specVersionRepository.findById(versionId).orElse(null);
        if (version == null) return null;
        if (request.getChangeSummary() != null) {
            version.setChangeSummary(request.getChangeSummary());
        }
        if (request.getIsCurrent() != null && request.getIsCurrent()) {
            List<SpecVersion> versions = specVersionRepository.findByPatent_PatentIdOrderByVersionNoDesc(version.getPatent().getPatentId());
            for (SpecVersion v : versions) {
                v.setCurrent(false);
            }
            version.setCurrent(true);

            try {
                specVersionService.saveAll(versions);
            } catch (Exception e) {
                // log and continue
            }
        }
        version.setUpdatedAt(LocalDateTime.now());
        try {
            specVersionService.save(version);
        } catch (Exception e) {
            // log and continue
        }

        return toFileVersionResponse(version);
    }

    public RestoreVersionResponse restoreDocumentVersion(Long versionId) {
        SpecVersion source = specVersionRepository.findById(versionId).orElse(null);
        if (source == null) return null;

        Patent patent = source.getPatent();
        List<SpecVersion> versions = specVersionRepository.findByPatent_PatentIdOrderByVersionNoDesc(patent.getPatentId());
        for (SpecVersion v : versions) {
            v.setCurrent(false);
        }

        try {
            specVersionService.saveAll(versions);
        } catch (Exception e) {
            // log and continue
        }


        SpecVersion newVersion = new SpecVersion();
        newVersion.setPatent(patent);
        newVersion.setApplicantId(source.getApplicantId());
        newVersion.setChangeSummary("Restored from version " + source.getVersionId());
        newVersion.setDocument(source.getDocument());
        int nextNo = versions.isEmpty() ? 1 : versions.get(0).getVersionNo() + 1;
        newVersion.setVersionNo(nextNo);
        newVersion.setCurrent(true);
        newVersion.setCreatedAt(LocalDateTime.now());
        newVersion.setUpdatedAt(LocalDateTime.now());

        try {
            specVersionService.save(newVersion);
        } catch (Exception e) {
            // log and continue
        }


        RestoreVersionResponse res = new RestoreVersionResponse();
        res.setPatentId(patent.getPatentId());
        res.setVersionId(newVersion.getVersionId());
        res.setNewVersionNo(newVersion.getVersionNo());
        res.setRestoredFrom(source.getVersionId());
        return res;
    }

    public boolean deleteDocumentVersion(Long versionId) {
        SpecVersion version = specVersionRepository.findById(versionId).orElse(null);
        if (version == null || version.isCurrent()) return false;
        specVersionRepository.delete(version);
        return true;
    }
    // ------------------- HELPER -------------------
    private PatentResponse toPatentResponse(Patent patent, List<FileAttachment> attachments) {
        PatentResponse response = new PatentResponse();
        response.setPatentId(patent.getPatentId());
        response.setApplicantId(patent.getApplicantId());
        response.setTitle(patent.getTitle());
        response.setType(patent.getType());
        response.setStatus(patent.getStatus());
        response.setCpc(patent.getCpc());
        response.setApplicationNumber(patent.getApplicationNumber());
        response.setInventor(patent.getInventor());
        response.setTechnicalField(patent.getTechnicalField());
        response.setBackgroundTechnology(patent.getBackgroundTechnology());
        response.setIpc(patent.getIpc());
    
        PatentResponse.InventionDetails details = new PatentResponse.InventionDetails();
        details.setProblemToSolve(patent.getProblemToSolve());
        details.setSolution(patent.getSolution());
        details.setEffect(patent.getEffect());
        response.setInventionDetails(details);
    
        response.setSummary(patent.getSummary());
        response.setDrawingDescription(patent.getDrawingDescription());
        response.setClaims(patent.getClaims());
    
        if (attachments != null) {
            response.setAttachmentIds(attachments.stream()
                    .map(FileAttachment::getFileId)
                    .collect(Collectors.toList()));
        } else {
            // ★ 변경: 전체 findAll() → 특정 특허에 속한 파일만 조회
            List<Long> attachmentIds = fileRepository.findByPatent_PatentId(patent.getPatentId())
                    .stream()
                    .map(FileAttachment::getFileId)
                    .collect(Collectors.toList());
            response.setAttachmentIds(attachmentIds);
        }
        return response;
    }


    private FileVersionResponse toFileVersionResponse(SpecVersion v) {
        FileVersionResponse res = new FileVersionResponse();
        res.setPatentId(v.getPatent().getPatentId());
        res.setVersionId(v.getVersionId());
        res.setVersionNo(v.getVersionNo());
        res.setApplicantId(v.getApplicantId());
        res.setChangeSummary(v.getChangeSummary());
        res.setCurrent(v.isCurrent());
        res.setCreatedAt(v.getCreatedAt());
        res.setUpdatedAt(v.getUpdatedAt());
        return res;
    }
}
