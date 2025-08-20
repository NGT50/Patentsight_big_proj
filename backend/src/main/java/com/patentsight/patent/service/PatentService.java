package com.patentsight.patent.service;

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
import com.patentsight.patent.domain.Patent;
import com.patentsight.review.service.ReviewService;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.dto.SubmitPatentResponse;
import com.patentsight.ai.dto.PredictRequest;
import com.patentsight.ai.dto.PredictResponse;
import com.patentsight.patent.repository.PatentRepository;
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

    private final PatentRepository patentRepository;
    private final ReviewService reviewService;
    private final FileRepository fileRepository;
    private final SpecVersionRepository specVersionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;

    @Value("${external-api.fastapi-ipc-url}")
    private String fastApiIpcUrl;

    private final NotificationService notificationService;

    public PatentService(PatentRepository patentRepository,
                         FileRepository fileRepository,
                         SpecVersionRepository specVersionRepository,
                         RestTemplate restTemplate,
                         NotificationService notificationService,
                         ReviewService reviewService) {
        this.patentRepository = patentRepository;
        this.fileRepository = fileRepository;
        this.specVersionRepository = specVersionRepository;
        this.restTemplate = restTemplate;
        this.notificationService = notificationService;
        this.reviewService = reviewService;
    }

    // ------------------- CREATE -------------------
    public PatentResponse createPatent(PatentRequest request, Long applicantId) {
        Patent patent = new Patent();
        patent.setTitle(request.getTitle());
        patent.setType(request.getType());
        patent.setApplicantId(applicantId);
        patent.setStatus(PatentStatus.DRAFT);
        patent.setCpc(request.getCpc());
        patent.setInventor(request.getInventor());
        patent.setTechnicalField(request.getTechnicalField());
        patent.setBackgroundTechnology(request.getBackgroundTechnology());

        if (request.getInventionDetails() != null) {
            patent.setProblemToSolve(request.getInventionDetails().getProblemToSolve());
            patent.setSolution(request.getInventionDetails().getSolution());
            patent.setEffect(request.getInventionDetails().getEffect());
        }

        patent.setSummary(request.getSummary());
        patent.setDrawingDescription(request.getDrawingDescription());
        patent.setClaims(request.getClaims());
        patentRepository.save(patent);

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
        if (request.getFileIds() != null && !request.getFileIds().isEmpty()) {
            attachments = fileRepository.findAllById(request.getFileIds());
            for (FileAttachment attachment : attachments) {
                attachment.setPatent(patent);
            }
            fileRepository.saveAll(attachments);
        }

        PatentResponse response = toPatentResponse(patent, attachments);

        try {
            SpecVersion initial = new SpecVersion();
            initial.setPatent(patent);
            initial.setApplicantId(applicantId);
            initial.setChangeSummary("initial draft");
            initial.setDocument(objectMapper.writeValueAsString(response));
            initial.setVersionNo(1);
            initial.setCurrent(true);
            LocalDateTime now = LocalDateTime.now();
            initial.setCreatedAt(now);
            initial.setUpdatedAt(now);
            specVersionRepository.save(initial);
        } catch (Exception ignored) {
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
        return patentRepository.findAll().stream()
                .filter(p -> applicantId.equals(p.getApplicantId()))
                .map(p -> toPatentResponse(p, null))
                .collect(Collectors.toList());
    }

    // ------------------- SUBMIT -------------------
    public SubmitPatentResponse submitPatent(Long patentId) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;

        String firstClaim = patent.getClaims() != null && !patent.getClaims().isEmpty() ? patent.getClaims().get(0) : "";
        PredictRequest requestBody = new PredictRequest(firstClaim);

        PredictResponse predictResponse = restTemplate.postForObject(fastApiIpcUrl, requestBody, PredictResponse.class);

        String ipcCode = "N/A";
        if (predictResponse != null && !predictResponse.getTopIpcResults().isEmpty()) {
            ipcCode = predictResponse.getTopIpcResults().get(0).getMaingroup();
        }

        patent.setStatus(PatentStatus.SUBMITTED);
        patent.setSubmittedAt(LocalDateTime.now());
        if (patent.getApplicationNumber() == null) {
            patent.setApplicationNumber(generateApplicationNumber(patent));
        }
        patent.setIpc(ipcCode);
        patentRepository.save(patent);

        reviewService.autoAssignWithSpecialty(patent);

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
        String serial = String.format("%07d", patent.getPatentId());
        return typeCode + year + serial;
    }

    // ------------------- UPDATE -------------------
    public PatentResponse updatePatentStatus(Long patentId, PatentStatus status) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;
        patent.setStatus(status);
        patentRepository.save(patent);

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

        patentRepository.save(patent);

        return toPatentResponse(patent, null);
    }

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
        specVersionRepository.save(current);

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
        specVersionRepository.saveAll(existing);

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
        specVersionRepository.save(version);

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
            specVersionRepository.saveAll(versions);
        }
        version.setUpdatedAt(LocalDateTime.now());
        specVersionRepository.save(version);
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
        specVersionRepository.saveAll(versions);

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
        specVersionRepository.save(newVersion);

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
            List<Long> attachmentIds = fileRepository.findAll().stream()
                    .filter(f -> f.getPatent() != null && f.getPatent().getPatentId().equals(patent.getPatentId()))
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
