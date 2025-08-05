package com.patentsight.patent.service;

import com.patentsight.file.domain.FileAttachment;
import com.patentsight.file.repository.FileRepository;
import com.patentsight.file.repository.SpecVersionRepository;
import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.repository.PatentRepository;
import com.patentsight.user.domain.User;
import com.patentsight.user.repository.UserRepository;
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
    private final UserRepository userRepository; // 🔹 추가

    public PatentService(PatentRepository patentRepository,
                         FileRepository fileRepository,
                         SpecVersionRepository specVersionRepository,
                         UserRepository userRepository) {
        this.patentRepository = patentRepository;
        this.fileRepository = fileRepository;
        this.specVersionRepository = specVersionRepository;
        this.userRepository = userRepository;
    }

    // 🔹 출원 생성
    public PatentResponse createPatent(PatentRequest request, Long applicantId) {
        Patent patent = new Patent();
        patent.setTitle(request.getTitle());
        patent.setType(request.getType());

        // 출원인(User) 설정
        if (applicantId != null) {
            User applicant = userRepository.findById(applicantId)
                    .orElseThrow(() -> new RuntimeException("Applicant not found"));
            patent.setApplicant(applicant);
        }

        patent.setStatus(PatentStatus.DRAFT);
        patentRepository.save(patent);

        PatentResponse response = new PatentResponse();
        response.setPatentId(patent.getPatentId());
        response.setStatus(patent.getStatus());
        return response;
    }

    // 🔹 출원 상세 조회
    @Transactional(readOnly = true)
    public PatentResponse getPatentDetail(Long patentId) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;

        PatentResponse res = new PatentResponse();
        res.setPatentId(patent.getPatentId());
        res.setTitle(patent.getTitle());
        res.setType(patent.getType());
        res.setStatus(patent.getStatus());

        // 첨부 파일 ID 조회
        List<Long> attachmentIds = fileRepository.findAll().stream()
                .filter(f -> f.getPatent() != null && f.getPatent().getPatentId().equals(patentId))
                .map(FileAttachment::getFileId)
                .collect(Collectors.toList());
        res.setAttachmentIds(attachmentIds);

        return res;
    }

    // 🔹 내 출원 목록 조회
    @Transactional(readOnly = true)
    public List<PatentResponse> getMyPatents(Long applicantId) {
        return patentRepository.findAll().stream()
                .filter(p -> p.getApplicant() != null && applicantId.equals(p.getApplicant().getUserId()))
                .map(p -> {
                    PatentResponse r = new PatentResponse();
                    r.setPatentId(p.getPatentId());
                    r.setTitle(p.getTitle());
                    r.setStatus(p.getStatus());
                    return r;
                })
                .collect(Collectors.toList());
    }

    // 🔹 출원 제출
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

    // 🔹 출원 상태 변경
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

    // 🔹 출원 수정
    public PatentResponse updatePatent(Long patentId, PatentRequest request) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return null;

        if (request.getTitle() != null) {
            patent.setTitle(request.getTitle());
        }
        if (request.getType() != null) {
            patent.setType(request.getType());
        }

        patentRepository.save(patent);

        PatentResponse res = new PatentResponse();
        res.setPatentId(patent.getPatentId());
        res.setTitle(patent.getTitle());
        res.setType(patent.getType());
        res.setStatus(patent.getStatus());
        return res;
    }

    // 🔹 출원 삭제
    public boolean deletePatent(Long patentId) {
        Patent patent = patentRepository.findById(patentId).orElse(null);
        if (patent == null) return false;
        patentRepository.delete(patent);
        return true;
    }
}
