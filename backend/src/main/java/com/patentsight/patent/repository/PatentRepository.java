package com.patentsight.patent.repository;

import com.patentsight.patent.domain.Patent;
import com.patentsight.patent.domain.PatentStatus;
import com.patentsight.patent.domain.PatentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatentRepository extends JpaRepository<Patent, Long> {

    Optional<Patent> findByApplicationNumber(String applicationNumber);

    // 🔹 전체 출원 단위로 미배정된 출원 조회
    @Query("""
        SELECT p FROM Patent p
        WHERE p.type = :type
        AND p.status = :status
        AND NOT EXISTS (
            SELECT 1 FROM Review r WHERE r.patent = p
        )
    """)
    List<Patent> findAllUnassignedByType(
            @Param("type") PatentType type,
            @Param("status") PatentStatus status
    );
}
