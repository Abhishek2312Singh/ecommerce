package com.smartparkhub.backend.repository;

import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndPassword(String email, String password);
    Optional<User> findByCollegeIdAndPassword(String collegeId, String password);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByCampus(String campus);

    /** Count only certain roles (e.g., STUDENT + FACULTY + STAFF — excluding ADMINs) */
    long countByRoleIn(Collection<Role> roles);
    List<User> findByRoleIn(Collection<Role> roles);
}
