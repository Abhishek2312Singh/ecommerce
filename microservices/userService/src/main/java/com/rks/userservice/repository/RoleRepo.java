package com.rks.userservice.repository;

import com.rks.userservice.entity.Role;
import com.rks.userservice.enums.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepo extends JpaRepository<Role,Long> {
    Optional<Role> findByRole(Roles role);

    boolean existsByRole(Roles role);
}
