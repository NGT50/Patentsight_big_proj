package com.patentsight.ai.service.impl;

import com.patentsight.ai.domain.Draft;
import com.patentsight.ai.domain.DraftType;
import com.patentsight.ai.dto.DraftDetailResponse;
import com.patentsight.ai.dto.DraftListResponse;
import com.patentsight.ai.repository.DraftRepository;
import com.patentsight.ai.service.DraftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DraftServiceImpl implements DraftService {

    private final DraftRepository draftRepository;

    @Override
    public void createDraft(Long patentId, DraftType type, String content) {
        Draft draft = new Draft();
        draft.setPatentId(patentId);
        draft.setType(type);
        draft.setContent(content);
        draftRepository.save(draft);
    }

    @Override
    public List<DraftListResponse> getDrafts(Long patentId) {
        return draftRepository.findByPatentIdOrderByCreatedAtDesc(patentId)
                .stream()
                .map(draft -> new DraftListResponse(
                        draft.getId(),
                        draft.getType(), // enum → 문자열 변환
                        draft.getContent()
                ))
                .toList();
    }

    @Override
    public DraftDetailResponse getDraft(Long draftId) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found"));
        return new DraftDetailResponse(draft.getId(), draft.getType(), draft.getContent());
    }

    @Override
    public DraftDetailResponse updateDraft(Long draftId, String content) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found"));

        draft.setContent(content);
        Draft updated = draftRepository.save(draft);

        return new DraftDetailResponse(updated.getId(), updated.getType(), updated.getContent());
    }

    @Override
    public void deleteDraft(Long draftId) {
        if (!draftRepository.existsById(draftId)) {
            throw new IllegalArgumentException("Draft not found");
        }
        draftRepository.deleteById(draftId);
    }

    @Override
    public DraftDetailResponse createAndReturnDraft(Long patentId, DraftType type, String content) {
        Draft draft = new Draft();
        draft.setPatentId(patentId);
        draft.setType(type);
        draft.setContent(content);
        Draft saved = draftRepository.save(draft);

        return new DraftDetailResponse(saved.getId(), saved.getType(), saved.getContent());
    }
}

