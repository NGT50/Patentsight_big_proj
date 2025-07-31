package com.patentsight.backend.repository;

import com.patentsight.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    // 필요하면 username으로 조회하는 메서드 추가
    User findByUsername(String username);
}
