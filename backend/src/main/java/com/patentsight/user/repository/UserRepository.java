package com.patentsight.user.repository;

import com.patentsight.user.domain.User;
import com.patentsight.user.domain.DepartmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    // 🔹 자동 배정용: 부서 기준 심사관 조회
    List<User> findByDepartment(DepartmentType department);
}