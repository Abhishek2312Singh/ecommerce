package com.smartparkhub.backend.repository;

import com.smartparkhub.backend.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CampusRepo extends JpaRepository<Campus, Long> {
    Optional<Campus> findByCampusKey(String campusKey);
    boolean existsByCampusKey(String campusKey);
}
