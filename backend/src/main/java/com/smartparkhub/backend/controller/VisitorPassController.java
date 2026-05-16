package com.smartparkhub.backend.controller;

import com.smartparkhub.backend.entity.VisitorPass;
import com.smartparkhub.backend.repository.UserRepo;
import com.smartparkhub.backend.repository.VisitorPassRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/visitor-passes")
public class VisitorPassController {

    @Autowired private VisitorPassRepo visitorPassRepo;
    @Autowired private UserRepo userRepo;

    @PostMapping
    public ResponseEntity<VisitorPass> createVisitorPass(@RequestBody VisitorPass pass,
                                                          Authentication auth) {
        String campus = resolveCampus(auth);
        boolean isSuperAdmin = isSuperAdmin(auth);
        if (!isSuperAdmin) {
            pass.setCampus(campus);
        } else if (pass.getCampus() == null || pass.getCampus().isBlank()) {
            pass.setCampus(campus != null ? campus : "main");
        }

        if (pass.getPassCode() == null || pass.getPassCode().isBlank()) {
            pass.setPassCode(UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase());
        }
        LocalDateTime issuedAt = LocalDateTime.now();
        pass.setIssuedAt(issuedAt);
        pass.setExpiresAt(issuedAt.plusHours(5));
        pass.setIssuedBy(auth != null ? auth.getName() : null);
        return ResponseEntity.ok(visitorPassRepo.save(pass));
    }

    @GetMapping("/active")
    public ResponseEntity<Long> getActiveVisitorCount(Authentication auth) {
        LocalDateTime now = LocalDateTime.now();
        String campus = campusScope(auth);
        long count = campus == null
                ? visitorPassRepo.countByExpiresAtAfter(now)
                : visitorPassRepo.countByCampusAndExpiresAtAfter(campus, now);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/daily-count")
    public ResponseEntity<Map<String, Object>> getDailyVisitorCount(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        LocalDate target = date != null ? date : LocalDate.now();
        LocalDateTime from = target.atStartOfDay();
        LocalDateTime to = target.plusDays(1).atStartOfDay();
        String campus = campusScope(auth);
        long count = campus == null
                ? visitorPassRepo.countByIssuedAtBetween(from, to)
                : visitorPassRepo.countByCampusAndIssuedAtBetween(campus, from, to);
        return ResponseEntity.ok(Map.of("date", target.toString(), "campus", campus == null ? "all" : campus, "count", count));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<VisitorPass>> getVisitorPassLogs(Authentication auth) {
        String campus = campusScope(auth);
        return ResponseEntity.ok(campus == null
                ? visitorPassRepo.findTop50ByOrderByIssuedAtDesc()
                : visitorPassRepo.findTop50ByCampusOrderByIssuedAtDesc(campus));
    }

    private boolean isSuperAdmin(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
    }

    private String campusScope(Authentication auth) {
        return isSuperAdmin(auth) ? null : resolveCampus(auth);
    }

    private String resolveCampus(Authentication auth) {
        if (auth == null) return null;
        if (auth.getCredentials() instanceof String campus && !campus.isBlank()) {
            return campus;
        }
        return userRepo.findByEmail(auth.getName())
                .map(user -> user.getCampus())
                .orElse(null);
    }
}
