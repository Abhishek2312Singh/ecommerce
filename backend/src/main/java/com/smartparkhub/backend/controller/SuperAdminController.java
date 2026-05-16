package com.smartparkhub.backend.controller;

import com.smartparkhub.backend.dto.CreateUserRequestDto;
import com.smartparkhub.backend.dto.UpdateUserRequestDto;
import com.smartparkhub.backend.entity.Campus;
import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.enums.Role;
import com.smartparkhub.backend.repository.CampusRepo;
import com.smartparkhub.backend.repository.SlotRepo;
import com.smartparkhub.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/superadmin")
public class SuperAdminController {

    @Autowired private UserRepo userRepo;
    @Autowired private CampusRepo campusRepo;
    @Autowired private SlotRepo slotRepo;

    /** GET /superadmin/admins — all users with role ADMIN */
    @GetMapping("/admins")
    public List<User> getAdmins() {
        return userRepo.findByRole(Role.ADMIN);
    }

    /** POST /superadmin/admins — create a campus admin account */
    @PostMapping("/admins")
    public ResponseEntity<User> createAdmin(@RequestBody CreateUserRequestDto dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(Role.ADMIN);
        user.setCampus(dto.getCampus());
        user.setCollegeId(dto.getCollegeId());
        user.setLicense(dto.getLicense());
        userRepo.save(user);
        return ResponseEntity.ok(user);
    }

    /** PUT /superadmin/admins/{id} — edit campus admin details */
    @PutMapping("/admins/{id}")
    public ResponseEntity<User> updateAdmin(@PathVariable Long id, @RequestBody UpdateUserRequestDto dto) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        User user = opt.get();
        if (dto.getName()      != null) user.setName(dto.getName());
        if (dto.getEmail()     != null) user.setEmail(dto.getEmail());
        if (dto.getCampus()    != null) user.setCampus(dto.getCampus());
        if (dto.getCollegeId() != null) user.setCollegeId(dto.getCollegeId());
        if (dto.getLicense()   != null) user.setLicense(dto.getLicense());
        userRepo.save(user);
        return ResponseEntity.ok(user);
    }

    /** DELETE /superadmin/admins/{id} — remove a campus admin */
    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        if (!userRepo.existsById(id)) return ResponseEntity.notFound().build();
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** PUT /superadmin/admins/{id}/reset-password — super admin resets an admin's password */
    @PutMapping("/admins/{id}/reset-password")
    public ResponseEntity<String> resetAdminPassword(@PathVariable Long id,
                                                      @RequestBody Map<String, String> body) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        String newPass = body.get("newPassword");
        if (newPass == null || newPass.isBlank()) return ResponseEntity.badRequest().body("newPassword is required");
        User user = opt.get();
        user.setPassword(newPass);
        userRepo.save(user);
        return ResponseEntity.ok("Password reset successfully");
    }

    /** GET /superadmin/stats — system-wide aggregate stats */
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        // Only count actual campus users (students, faculty, staff) — not admins
        List<com.smartparkhub.backend.enums.Role> userRoles = List.of(
            com.smartparkhub.backend.enums.Role.STUDENT,
            com.smartparkhub.backend.enums.Role.FACULTY,
            com.smartparkhub.backend.enums.Role.STAFF
        );
        Map<String, Object> stats = new HashMap<>();
        stats.put("campusCount",     campusRepo.count());
        stats.put("adminCount",      userRepo.findByRole(Role.ADMIN).size());
        stats.put("totalUsers",      userRepo.countByRoleIn(userRoles));
        stats.put("superAdminCount", userRepo.findByRole(Role.SUPER_ADMIN).size());
        return stats;
    }

    /**
     * GET /superadmin/campuses/summary
     * Returns per-campus breakdown: campus info, assigned admin, total/available/occupied slots.
     * Falls back to Campus.totalSlots if no real Slot rows exist for that campus yet.
     */
    @GetMapping("/campuses/summary")
    public List<Map<String, Object>> getCampusSummary() {
        List<Campus> campuses = campusRepo.findAll();
        List<User>   allAdmins = userRepo.findByRole(Role.ADMIN);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Campus campus : campuses) {
            String key = campus.getCampusKey();

            // Assigned admin for this campus (first match)
            String adminName = allAdmins.stream()
                .filter(a -> key != null && key.equalsIgnoreCase(a.getCampus()))
                .findFirst()
                .map(User::getName)
                .orElse("—");

            // Real slot counts scoped by campusKey
            long totalReal  = key != null ? slotRepo.countByCampusKey(key) : 0;
            long occupied   = key != null ? slotRepo.countByCampusKeyAndOccupied(key, true) : 0;
            long free       = totalReal - occupied;
            int  loadPct    = totalReal > 0 ? (int) Math.round(occupied * 100.0 / totalReal) : 0;

            // Displayed total: real slots if seeded, else Campus.totalSlots
            long displayTotal = totalReal > 0
                ? totalReal
                : (campus.getTotalSlots() != null ? campus.getTotalSlots() : 0);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id",         campus.getId());
            row.put("name",       campus.getName());
            row.put("campusKey",  key);
            row.put("location",   campus.getLocation());
            row.put("admin",      adminName);
            row.put("totalSlots", displayTotal);
            // null signals "not yet seeded" — frontend shows "—" instead of 0
            row.put("available",  totalReal > 0 ? free     : null);
            row.put("occupied",   totalReal > 0 ? occupied : null);
            row.put("loadPct",    totalReal > 0 ? loadPct  : null);
            result.add(row);
        }

        return result;
    }
}
