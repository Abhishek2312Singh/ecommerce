package com.smartparkhub.backend.repository;

import com.smartparkhub.backend.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepo extends JpaRepository<Slot, Long> {
    List<Slot> findByZone(String zone);
    List<Slot> findByType(String type);
    long countByOccupied(boolean occupied);

    /** Campus-scoped queries */
    List<Slot> findByCampusKey(String campusKey);
    Optional<Slot> findFirstByCampusKeyAndZoneAndOccupiedFalseOrderByIdAsc(String campusKey, String zone);
    Optional<Slot> findFirstByCampusKeyAndOccupiedFalseOrderByIdAsc(String campusKey);
    long countByCampusKeyAndOccupied(String campusKey, boolean occupied);
    long countByCampusKey(String campusKey);
}
