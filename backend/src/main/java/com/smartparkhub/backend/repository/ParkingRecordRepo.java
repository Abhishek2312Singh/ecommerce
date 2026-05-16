package com.smartparkhub.backend.repository;

import com.smartparkhub.backend.entity.ParkingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingRecordRepo extends JpaRepository<ParkingRecord, Long> {
    List<ParkingRecord> findByUserIdOrderByEntryTimeDesc(Long userId);
    List<ParkingRecord> findByExitTimeIsNullOrderByEntryTimeDesc();
    List<ParkingRecord> findTop50ByOrderByEntryTimeDesc();
    Optional<ParkingRecord> findFirstByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(Long userId);
}
