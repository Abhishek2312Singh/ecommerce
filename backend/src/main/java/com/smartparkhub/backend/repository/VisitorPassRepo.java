package com.smartparkhub.backend.repository;

import com.smartparkhub.backend.entity.VisitorPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitorPassRepo extends JpaRepository<VisitorPass, Long> {
    long countByExpiresAtAfter(LocalDateTime now);
    long countByCampusAndExpiresAtAfter(String campus, LocalDateTime now);
    long countByIssuedAtBetween(LocalDateTime from, LocalDateTime to);
    long countByCampusAndIssuedAtBetween(String campus, LocalDateTime from, LocalDateTime to);
    List<VisitorPass> findTop50ByOrderByIssuedAtDesc();
    List<VisitorPass> findTop50ByCampusOrderByIssuedAtDesc(String campus);
}
