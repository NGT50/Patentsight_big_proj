package com.patentsight.patent.service;

import com.patentsight.file.domain.FileAttachment;
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
                    r.setTitle(p.getTitle());
                    r.setStatus(p.getStatus());
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
        res.setStatus(patent.getStatus());
        res.setApplicationNumber(patent.getApplicationNumber());
        return res;
    }

    private String generateApplicationNumber(Patent patent) {
        String typeCode;
        switch (patent.getType()) {
            case PATENT -> typeCode = "10";
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
}
