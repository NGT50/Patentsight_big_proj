package com.patentsight.patent.repository;

import com.patentsight.patent.model.Patent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatentRepository extends JpaRepository<Patent, Long> {
}
