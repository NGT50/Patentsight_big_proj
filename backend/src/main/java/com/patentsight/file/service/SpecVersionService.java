package com.patentsight.file.service;

import com.patentsight.file.domain.SpecVersion;
import com.patentsight.file.repository.SpecVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SpecVersionService {
    private final SpecVersionRepository specVersionRepository;

    public SpecVersionService(SpecVersionRepository specVersionRepository) {
        this.specVersionRepository = specVersionRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void save(SpecVersion version) {
        specVersionRepository.save(version);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAll(Iterable<SpecVersion> versions) {
        specVersionRepository.saveAll(versions);
    }
}
