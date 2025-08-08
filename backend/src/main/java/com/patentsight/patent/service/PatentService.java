package com.patentsight.patent.service;

import com.patentsight.patent.dto.PatentRequest;
import com.patentsight.patent.dto.PatentResponse;
import com.patentsight.patent.model.FileAttachment;
import com.patentsight.patent.model.Patent;
import com.patentsight.patent.repository.FileAttachmentRepository;
import com.patentsight.patent.repository.PatentRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatentService {

    private final PatentRepository patentRepository;
    private final FileAttachmentRepository fileAttachmentRepository;

    public PatentService(PatentRepository patentRepository,
                         FileAttachmentRepository fileAttachmentRepository) {
        this.patentRepository = patentRepository;
        this.fileAttachmentRepository = fileAttachmentRepository;
    }

    public PatentResponse createPatent(PatentRequest request) {
        Patent patent = new Patent();
        patent.setTitle(request.getTitle());
        patent.setType(request.getType());

        if (request.getFileIds() != null && !request.getFileIds().isEmpty()) {
            List<FileAttachment> attachments = fileAttachmentRepository.findAllById(request.getFileIds());
            patent.setAttachments(new HashSet<>(attachments));
        }

        Patent saved = patentRepository.save(patent);

        PatentResponse response = new PatentResponse();
        response.setPatentId(saved.getPatentId());
        response.setTitle(saved.getTitle());
        response.setType(saved.getType());
        List<Long> attachmentIds = saved.getAttachments().stream()
                .map(FileAttachment::getId)
                .collect(Collectors.toList());
        response.setAttachmentIds(attachmentIds);
        return response;
    }
}
