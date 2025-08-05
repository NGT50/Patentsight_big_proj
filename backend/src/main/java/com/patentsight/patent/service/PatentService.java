package com.patentsight.patent.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.domain.SpecVersion;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patentsight.file.dto.DocumentContentResponse;
import com.patentsight.file.dto.DocumentVersionRequest;
import com.patentsight.file.dto.FileVersionInfoRequest;
import com.patentsight.file.dto.FileVersionResponse;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.file.repository.SpecVersionRepository;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.repository.PatentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatentService {

    private final PatentRepository patentRepository;
    private final FileRepository fileRepository;
    private final SpecVersionRepository specVersionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PatentService(PatentRepository patentRepository,
                         FileRepository fileRepository,
                         SpecVersionRepository specVersionRepository) {
        this.patentRepository = patentRepository;
        this.fileRepository = fileRepository;
        this.specVersionRepository = specVersionRepository;
    }

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

        List<FileAttachment> attachments = java.util.Collections.emptyList();
        if (request.getFileIds() != null && !request.getFileIds().isEmpty()) {
            attachments = fileRepository.findAllById(request.getFileIds());
            for (FileAttachment attachment : attachments) {
                attachment.setPatent(patent);
            }
            fileRepository.saveAll(attachments);
        }

        PatentResponse response = new PatentResponse();
        response.setPatentId(patent.getPatentId());
        response.setApplicantId(patent.getApplicantId());
        response.setTitle(patent.getTitle());
        response.setType(patent.getType());
        response.setStatus(patent.getStatus());
        response.setAttachmentIds(attachments.stream()
                .map(FileAttachment::getFileId)
                .collect(Collectors.toList()));
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
        return response;
    }

    @Transactional(readOnly = true)
    public PatentResponse getPatentDetail(Long patentId) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;
        PatentResponse res = new PatentResponse();
        res.setPatentId(patent.getPatentId());
        res.setApplicantId(patent.getApplicantId());
        res.setTitle(patent.getTitle());
        res.setType(patent.getType());
        res.setStatus(patent.getStatus());
        res.setCpc(patent.getCpc());
        res.setApplicationNumber(patent.getApplicationNumber());
        res.setInventor(patent.getInventor());
        res.setTechnicalField(patent.getTechnicalField());
        res.setBackgroundTechnology(patent.getBackgroundTechnology());
        PatentResponse.InventionDetails details = new PatentResponse.InventionDetails();
        details.setProblemToSolve(patent.getProblemToSolve());
        details.setSolution(patent.getSolution());
        details.setEffect(patent.getEffect());
        res.setInventionDetails(details);
        res.setSummary(patent.getSummary());
        res.setDrawingDescription(patent.getDrawingDescription());
        res.setClaims(patent.getClaims());
        List<Long> attachmentIds = fileRepository.findAll().stream()
                .filter(f -> f.getPatent() != null && f.getPatent().getPatentId().equals(patentId))
                .map(FileAttachment::getFileId)
                .collect(Collectors.toList());
        res.setAttachmentIds(attachmentIds);
        return res;
    }

    @Transactional(readOnly = true)
    public List<PatentResponse> getMyPatents(Long applicantId) {
        return patentRepository.findAll().stream()
                .filter(p -> applicantId.equals(p.getApplicantId()))
                .map(p -> {
                    PatentResponse r = new PatentResponse();
                    r.setPatentId(p.getPatentId());
                    r.setApplicantId(p.getApplicantId());
                    r.setTitle(p.getTitle());
                    r.setType(p.getType());
                    r.setStatus(p.getStatus());
                    r.setCpc(p.getCpc());
                    r.setApplicationNumber(p.getApplicationNumber());
                    r.setInventor(p.getInventor());
                    r.setTechnicalField(p.getTechnicalField());
                    r.setBackgroundTechnology(p.getBackgroundTechnology());
                    PatentResponse.InventionDetails details = new PatentResponse.InventionDetails();
                    details.setProblemToSolve(p.getProblemToSolve());
                    details.setSolution(p.getSolution());
                    details.setEffect(p.getEffect());
                    r.setInventionDetails(details);
                    r.setSummary(p.getSummary());
                    r.setDrawingDescription(p.getDrawingDescription());
                    r.setClaims(p.getClaims());
                    List<Long> attachmentIds = fileRepository.findAll().stream()
                            .filter(f -> f.getPatent() != null && f.getPatent().getPatentId().equals(p.getPatentId()))
                            .map(FileAttachment::getFileId)
                            .collect(Collectors.toList());
                    r.setAttachmentIds(attachmentIds);
                    return r;
                })
                .collect(Collectors.toList());
    }

    public PatentResponse submitPatent(Long patentId) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;
        patent.setStatus(PatentStatus.SUBMITTED);
        patent.setSubmittedAt(LocalDateTime.now());
        if (patent.getApplicationNumber() == null) {
            patent.setApplicationNumber(generateApplicationNumber(patent));
        }
        patentRepository.save(patent);
        PatentResponse res = new PatentResponse();
        res.setPatentId(patent.getPatentId());
        res.setApplicantId(patent.getApplicantId());
        res.setStatus(patent.getStatus());
        res.setApplicationNumber(patent.getApplicationNumber());
        return res;
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

    public PatentResponse updatePatentStatus(Long patentId, PatentStatus status) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;
        patent.setStatus(status);
        patentRepository.save(patent);
        PatentResponse res = new PatentResponse();
        res.setPatentId(patent.getPatentId());
        res.setApplicantId(patent.getApplicantId());
        res.setStatus(patent.getStatus());
        return res;
    }

    public PatentResponse updatePatent(Long patentId, PatentRequest request) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;
        if (request.getTitle() != null) {
            patent.setTitle(request.getTitle());
        }
        if (request.getType() != null) {
            patent.setType(request.getType());
        }
        if (request.getCpc() != null) {
            patent.setCpc(request.getCpc());
        }
        if (request.getInventor() != null) {
            patent.setInventor(request.getInventor());
        }
        if (request.getTechnicalField() != null) {
            patent.setTechnicalField(request.getTechnicalField());
        }
        if (request.getBackgroundTechnology() != null) {
            patent.setBackgroundTechnology(request.getBackgroundTechnology());
        }
        if (request.getInventionDetails() != null) {
            PatentRequest.InventionDetails d = request.getInventionDetails();
            if (d.getProblemToSolve() != null) patent.setProblemToSolve(d.getProblemToSolve());
            if (d.getSolution() != null) patent.setSolution(d.getSolution());
            if (d.getEffect() != null) patent.setEffect(d.getEffect());
        }
        if (request.getSummary() != null) {
            patent.setSummary(request.getSummary());
        }
        if (request.getDrawingDescription() != null) {
            patent.setDrawingDescription(request.getDrawingDescription());
        }
        if (request.getClaims() != null) {
            patent.setClaims(request.getClaims());
        }
        patentRepository.save(patent);
        PatentResponse res = new PatentResponse();
        res.setPatentId(patent.getPatentId());
        res.setApplicantId(patent.getApplicantId());
        res.setTitle(patent.getTitle());
        res.setType(patent.getType());
        res.setStatus(patent.getStatus());
        res.setCpc(patent.getCpc());
        res.setApplicationNumber(patent.getApplicationNumber());
        res.setInventor(patent.getInventor());
        res.setTechnicalField(patent.getTechnicalField());
        res.setBackgroundTechnology(patent.getBackgroundTechnology());
        PatentResponse.InventionDetails details = new PatentResponse.InventionDetails();
        details.setProblemToSolve(patent.getProblemToSolve());
        details.setSolution(patent.getSolution());
        details.setEffect(patent.getEffect());
        res.setInventionDetails(details);
        res.setSummary(patent.getSummary());
        res.setDrawingDescription(patent.getDrawingDescription());
        res.setClaims(patent.getClaims());
        return res;
    }

    public boolean deletePatent(Long patentId) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return false;
        patentRepository.delete(patent);
        return true;
    }

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
            current.setAuthorId(patent.getApplicantId());
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
        version.setAuthorId(request.getAuthorId());
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

    public FileVersionResponse restoreDocumentVersion(Long versionId) {
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
        newVersion.setAuthorId(source.getAuthorId());
        newVersion.setChangeSummary("Restored from version " + source.getVersionId());
        newVersion.setDocument(source.getDocument());
        int nextNo = versions.isEmpty() ? 1 : versions.get(0).getVersionNo() + 1;
        newVersion.setVersionNo(nextNo);
        newVersion.setCurrent(true);
        newVersion.setCreatedAt(LocalDateTime.now());
        newVersion.setUpdatedAt(LocalDateTime.now());
        specVersionRepository.save(newVersion);
        return toFileVersionResponse(newVersion);
    }

    public boolean deleteDocumentVersion(Long versionId) {
        SpecVersion version = specVersionRepository.findById(versionId).orElse(null);
        if (version == null || version.isCurrent()) return false;
        specVersionRepository.delete(version);
        return true;
    }

    private FileVersionResponse toFileVersionResponse(SpecVersion v) {
        FileVersionResponse res = new FileVersionResponse();
        res.setPatentId(v.getPatent().getPatentId());
        res.setVersionId(v.getVersionId());
        res.setVersionNo(v.getVersionNo());
        res.setAuthorId(v.getAuthorId());
        res.setChangeSummary(v.getChangeSummary());
        res.setCurrent(v.isCurrent());
        res.setCreatedAt(v.getCreatedAt());
        return res;
    }
}
