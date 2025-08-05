package com.patentsight.patent.repository;

import com.patentsight.patent.domain.Patent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatentRepository extends JpaRepository<Patent, Long> {

    // applicant(User)의 userId로 조회
    Optional<Patent> findByApplicantUserId(Long applicantId);
}