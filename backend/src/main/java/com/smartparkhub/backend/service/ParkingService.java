package com.smartparkhub.backend.service;

import com.smartparkhub.backend.entity.ParkingRecord;
import com.smartparkhub.backend.entity.Slot;
import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.repository.ParkingRecordRepo;
import com.smartparkhub.backend.repository.SlotRepo;
import com.smartparkhub.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ParkingService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private SlotRepo slotRepo;

    @Autowired
    private ParkingRecordRepo parkingRecordRepo;

    public Map<String, Object> toggleParking(
            Long id,
            Authentication auth) {
        Optional<User> opt = userRepo.findById(id);

        if (opt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = opt.get();

        boolean isAdmin = auth != null
                && auth.getAuthorities().stream()
                .anyMatch(a ->
                        a.getAuthority().contains("ADMIN")
                                || a.getAuthority().contains("SUPER_ADMIN"));

        if (!isAdmin &&
                (auth == null
                        || !user.getEmail().equals(auth.getName()))) {

            throw new RuntimeException("Access denied");
        }

        boolean newState =
                !Boolean.TRUE.equals(user.getIsParked());

        user.setIsParked(newState);

        Optional<ParkingRecord> parkingRecord;

        if (newState) {
            parkingRecord = createParkingRecord(user);
        } else {
            parkingRecord = closeActiveParkingRecord(user);
        }

        userRepo.save(user);

        Map<String, Object> body = new HashMap<>();

        body.put("id", user.getId());
        body.put("name", user.getName());
        body.put("email", user.getEmail());
        body.put("isParked", user.getIsParked());

        parkingRecord.ifPresent(
                record -> body.put("parkingRecord", record)
        );

        return body;
    }

    public Optional<ParkingRecord> ensureActiveParkingRecord(User user) {
        if (!Boolean.TRUE.equals(user.getIsParked())) {
            return Optional.empty();
        }
        Optional<ParkingRecord> existing =
                parkingRecordRepo.findFirstByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(user.getId());
        return existing.isPresent() ? existing : createParkingRecord(user);
    }

    private Optional<ParkingRecord> createParkingRecord(User user) {
        if (parkingRecordRepo.findFirstByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(user.getId()).isPresent()) {
            return parkingRecordRepo.findFirstByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(user.getId());
        }

        String zone = zoneForRole(user);
        Optional<Slot> slot = findAvailableSlot(user.getCampus(), zone);
        slot.ifPresent(s -> {
            s.setOccupied(true);
            slotRepo.save(s);
        });

        ParkingRecord record = new ParkingRecord();
        record.setUserId(user.getId());
        record.setUserName(user.getName());
        record.setUserEmail(user.getEmail());
        record.setUserRole(user.getRole() != null ? user.getRole().name() : null);
        record.setCampus(user.getCampus());
        record.setSlotId(slot.map(Slot::getId).orElse(null));
        record.setZone(slot.map(Slot::getZone).orElse(zone));
        record.setVehicleNo(user.getVehicle());
        record.setEntryTime(LocalDateTime.now());
        return Optional.of(parkingRecordRepo.save(record));
    }

    private Optional<ParkingRecord> closeActiveParkingRecord(User user) {
        Optional<ParkingRecord> active =
                parkingRecordRepo.findFirstByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(user.getId());
        if (active.isEmpty()) {
            ParkingRecord record = buildParkingRecord(user);
            LocalDateTime now = LocalDateTime.now();
            record.setEntryTime(now);
            record.setExitTime(now);
            return Optional.of(parkingRecordRepo.save(record));
        }

        ParkingRecord record = active.get();
        record.setExitTime(LocalDateTime.now());
        ParkingRecord saved = parkingRecordRepo.save(record);

        if (record.getSlotId() != null) {
            slotRepo.findById(record.getSlotId()).ifPresent(slot -> {
                slot.setOccupied(false);
                slotRepo.save(slot);
            });
        }
        return Optional.of(saved);
    }

    private ParkingRecord buildParkingRecord(User user) {
        ParkingRecord record = new ParkingRecord();
        record.setUserId(user.getId());
        record.setUserName(user.getName());
        record.setUserEmail(user.getEmail());
        record.setUserRole(user.getRole() != null ? user.getRole().name() : null);
        record.setCampus(user.getCampus());
        record.setZone(zoneForRole(user));
        record.setVehicleNo(user.getVehicle());
        return record;
    }

    private Optional<Slot> findAvailableSlot(String campus, String zone) {
        if (campus != null && !campus.isBlank()) {
            Optional<Slot> zoneSlot = slotRepo.findFirstByCampusKeyAndZoneAndOccupiedFalseOrderByIdAsc(campus, zone);
            if (zoneSlot.isPresent()) return zoneSlot;
            return slotRepo.findFirstByCampusKeyAndOccupiedFalseOrderByIdAsc(campus);
        }
        return Optional.empty();
    }

    private String zoneForRole(User user) {

        if (user.getRole() == null)
            return "A";

        return switch (user.getRole()) {
            case FACULTY -> "B";
            case STAFF -> "C";
            default -> "A";
        };
    }

}