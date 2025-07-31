package com.patentsight.backend.repository;

import com.patentsight.backend.model.Patent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatentRepository extends JpaRepository<Patent, Long> {
}
