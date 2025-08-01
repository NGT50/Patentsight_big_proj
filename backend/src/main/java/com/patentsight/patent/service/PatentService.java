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
        patentRepository.save(patent);

        PatentResponse response = new PatentResponse();
        response.setPatentId(patent.getPatentId());
        response.setStatus(patent.getStatus());
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
        patentRepository.save(patent);
        PatentResponse res = new PatentResponse();
        res.setPatentId(patent.getPatentId());
        res.setStatus(patent.getStatus());
        return res;
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
}
