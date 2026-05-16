package com.smartparkhub.backend.controller;

import com.smartparkhub.backend.dto.ChangePasswordDto;
import com.smartparkhub.backend.dto.LoginRequestDto;
import com.smartparkhub.backend.entity.ParkingRecord;
import com.smartparkhub.backend.entity.Slot;
import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.repository.ParkingRecordRepo;
import com.smartparkhub.backend.repository.SlotRepo;
import com.smartparkhub.backend.repository.UserRepo;
import com.smartparkhub.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class UserController {

    @Autowired private UserRepo userRepo;
    @Autowired private SlotRepo slotRepo;
    @Autowired private ParkingRecordRepo parkingRecordRepo;
    @Autowired private JwtUtil  jwtUtil;

    /**
     * POST /login — authenticate any user.
     * Returns: { token: "JWT...", user: { id, name, email, role, campus, isParked, ... } }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto dto) {
        Optional<User> opt = userRepo.findByEmailAndPassword(dto.getEmail(), dto.getPassword());
        if (opt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Invalid email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }
        User user = opt.get();
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : "STUDENT",
                user.getCampus()
        );
        Map<String, Object> body = new HashMap<>();
        body.put("token", token);
        body.put("user",  toSafeMap(user));
        return ResponseEntity.ok(body);
    }

    /**
     * PUT /users/{id}/change-password — user changes their own password.
     */
    @PutMapping("/users/{id}/change-password")
    public ResponseEntity<String> changePassword(@PathVariable Long id,
                                                  @RequestBody ChangePasswordDto dto,
                                                  Authentication auth) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        User user = opt.get();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("SUPER_ADMIN"));

        if (!isAdmin && !user.getEmail().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        if (!user.getPassword().equals(dto.getOldPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password is incorrect");
        }
        if (dto.getNewPassword() == null || dto.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body("New password cannot be empty");
        }
        user.setPassword(dto.getNewPassword());
        userRepo.save(user);
        return ResponseEntity.ok("Password changed successfully");
    }

    /**
     * PUT /users/{id}/toggle-parking — user self-reports parking state.
     * Temporary endpoint until QR/gate scanning is implemented.
     * Returns the updated user map including the new isParked value.
     */
    @PutMapping("/users/{id}/toggle-parking")
    public ResponseEntity<Map<String, Object>> toggleParking(@PathVariable Long id,
                                                              Authentication auth) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        User user = opt.get();

        // Only the user themselves (or an admin) may toggle
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("SUPER_ADMIN"));
        if (!isAdmin && (auth == null || !user.getEmail().equals(auth.getName()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean newState = !Boolean.TRUE.equals(user.getIsParked());
        user.setIsParked(newState);

        Optional<ParkingRecord> parkingRecord;
        if (newState) {
            parkingRecord = createParkingRecord(user);
        } else {
            parkingRecord = closeActiveParkingRecord(user);
        }

        userRepo.save(user);

        Map<String, Object> body = toSafeMap(user);
        parkingRecord.ifPresent(record -> body.put("parkingRecord", record));
        return ResponseEntity.ok(body);
    }

    /** GET /users/{id} — fetch safe user profile */
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long id) {
        return userRepo.findById(id)
                .map(u -> ResponseEntity.ok(toSafeMap(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Helper: build a response map without the password ────────────────────

    public static Map<String, Object> toSafeMap(User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",           user.getId());
        m.put("name",         user.getName());
        m.put("email",        user.getEmail());
        m.put("role",         user.getRole() != null ? user.getRole().name() : null);
        m.put("campus",       user.getCampus());
        m.put("batch",        user.getBatch());
        m.put("collegeId",    user.getCollegeId());
        m.put("license",      user.getLicense());
        m.put("vehicle",      user.getVehicle());
        m.put("vehicleType",  user.getVehicleType() != null ? user.getVehicleType().name() : null);
        m.put("vehicleName",  user.getVehicleName());
        m.put("vehicleImage", user.getVehicleImage());
        m.put("isParked",     Boolean.TRUE.equals(user.getIsParked()));
        // password intentionally omitted
        return m;
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
        if (user.getRole() == null) return "A";
        return switch (user.getRole()) {
            case FACULTY -> "B";
            case STAFF -> "C";
            default -> "A";
        };
    }
}
