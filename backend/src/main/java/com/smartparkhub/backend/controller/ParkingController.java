package com.smartparkhub.backend.controller;

import com.smartparkhub.backend.entity.ParkingRecord;
import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.repository.ParkingRecordRepo;
import com.smartparkhub.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parking")
public class ParkingController {

    @Autowired private ParkingRecordRepo parkingRecordRepo;
    @Autowired private UserRepo userRepo;
    @Autowired private UserController userController;

    /** GET /parking/user/{userId} - current and past parking sessions for one user. */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ParkingRecord>> getUserParkingHistory(@PathVariable Long userId,
                                                                      Authentication auth) {
        if (!canAccessUser(userId, auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        userRepo.findById(userId).ifPresent(userController::ensureActiveParkingRecord);
        return ResponseEntity.ok(parkingRecordRepo.findByUserIdOrderByEntryTimeDesc(userId));
    }

    /** GET /parking/active - all currently parked sessions. */
    @GetMapping("/active")
    public ResponseEntity<List<ParkingRecord>> getActiveParking(Authentication auth) {
        String campus = campusScope(auth);
        userRepo.findAll().forEach(userController::ensureActiveParkingRecord);
        List<ParkingRecord> active = parkingRecordRepo.findByExitTimeIsNullOrderByEntryTimeDesc();
        if (campus == null) {
            return ResponseEntity.ok(active);
        }
        return ResponseEntity.ok(active.stream()
                .filter(record -> campus.equalsIgnoreCase(record.getCampus()))
                .toList());
    }

    /** GET /parking/logs?limit=N - recent parking sessions for admin activity screens. */
    @GetMapping("/logs")
    public ResponseEntity<List<ParkingRecord>> getRecentLogs(@RequestParam(defaultValue = "10") int limit,
                                                              Authentication auth) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        String campus = campusScope(auth);
        userRepo.findAll().forEach(userController::ensureActiveParkingRecord);
        List<ParkingRecord> logs = parkingRecordRepo.findTop50ByOrderByEntryTimeDesc();
        if (campus != null) {
            logs = logs.stream()
                    .filter(record -> campus.equalsIgnoreCase(record.getCampus()))
                    .toList();
        }
        return ResponseEntity.ok(logs.stream().limit(safeLimit).toList());
    }

    private boolean canAccessUser(Long userId, Authentication auth) {
        if (auth == null) return false;
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("SUPER_ADMIN"));
        if (isAdmin) return true;

        return userRepo.findById(userId)
                .map(User::getEmail)
                .map(email -> email.equals(auth.getName()))
                .orElse(false);
    }

    private String campusScope(Authentication auth) {
        if (auth == null) return null;
        boolean isSuperAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (isSuperAdmin) return null;
        return auth.getCredentials() instanceof String campus && !campus.isBlank() ? campus : null;
    }
}
