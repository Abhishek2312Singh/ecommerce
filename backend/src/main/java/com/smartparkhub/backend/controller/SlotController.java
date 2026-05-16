package com.smartparkhub.backend.controller;

import com.smartparkhub.backend.entity.Slot;
import com.smartparkhub.backend.repository.SlotRepo;
import com.smartparkhub.backend.repository.UserRepo;
import com.smartparkhub.backend.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/slots")
public class SlotController {

    @Autowired private SlotService slotService;
    @Autowired private SlotRepo   slotRepo;
    @Autowired private UserRepo   userRepo;

    /** GET /slots — all slots (super-admin sees all) */
    @GetMapping
    public ResponseEntity<List<Slot>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    /**
     * GET /slots/campus/{campusKey} — slots for a specific campus.
     * Campus admin uses this to manage their own campus slots.
     */
    @GetMapping("/campus/{campusKey}")
    public ResponseEntity<List<Slot>> getSlotsByCampus(@PathVariable String campusKey) {
        return ResponseEntity.ok(slotRepo.findByCampusKey(campusKey));
    }

    /**
     * POST /slots/campus/{campusKey}/seed?count=N&zone=A&type=STUDENT
     * Convenience: bulk-create N slots for a campus (campus admin action).
     */
    @PostMapping("/campus/{campusKey}/seed")
    public ResponseEntity<List<Slot>> seedCampusSlots(
            @PathVariable String campusKey,
            @RequestParam(defaultValue = "10") int count,
            @RequestParam(defaultValue = "A")  String zone,
            @RequestParam(defaultValue = "STUDENT") String type,
            Authentication auth) {

        // Only admins of this campus (or super admins) may seed it
        // Security is handled at the Spring Security layer; just enforce campusKey ownership here.
        boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (!isSuperAdmin) {
            String callerCampus = resolveCallerCampus(auth);
            if (callerCampus == null || !callerCampus.equalsIgnoreCase(campusKey)) {
                return ResponseEntity.status(403).build();
            }
        }

        List<Slot> created = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            Slot s = new Slot();
            s.setCampusKey(campusKey);
            s.setZone(zone.toUpperCase());
            try { s.setType(com.smartparkhub.backend.enums.SlotType.valueOf(type.toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
            s.setOccupied(false);
            created.add(slotRepo.save(s));
        }
        return ResponseEntity.ok(created);
    }

    /**
     * DELETE /slots/campus/{campusKey} — remove all slots for a campus.
     * Used when campus admin wants to reset slot configuration.
     */
    @DeleteMapping("/campus/{campusKey}")
    public ResponseEntity<Map<String, Long>> deleteCampusSlots(
            @PathVariable String campusKey,
            Authentication auth) {

        boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (!isSuperAdmin) {
            String callerCampus = resolveCallerCampus(auth);
            if (callerCampus == null || !callerCampus.equalsIgnoreCase(campusKey)) {
                return ResponseEntity.status(403).build();
            }
        }

        List<Slot> toDelete = slotRepo.findByCampusKey(campusKey);
        slotRepo.deleteAll(toDelete);
        return ResponseEntity.ok(Map.of("deleted", (long) toDelete.size()));
    }

    private String resolveCallerCampus(Authentication auth) {
        if (auth == null) return null;
        if (auth.getCredentials() instanceof String campus && !campus.isBlank()) {
            return campus;
        }
        return userRepo.findByEmail(auth.getName())
                .map(user -> user.getCampus())
                .filter(campus -> campus != null && !campus.isBlank())
                .orElse(null);
    }

    /** POST /slots/create — create a single slot */
    @PostMapping("/create")
    public ResponseEntity<Slot> createSlot(@RequestBody Slot slot) {
        return ResponseEntity.ok(slotService.createSlot(slot));
    }

    /** PUT /slots/{id} — toggle occupancy (park / unpark) */
    @PutMapping("/{id}")
    public ResponseEntity<Slot> updateSlot(@PathVariable Long id, @RequestBody Boolean occupied) {
        return ResponseEntity.ok(slotService.updateSlot(id, occupied));
    }

    /** GET /slots/zone/{zone} — slots by zone */
    @GetMapping("/zone/{zone}")
    public ResponseEntity<List<Slot>> getSlotsByZone(@PathVariable String zone) {
        return ResponseEntity.ok(slotService.getSlotsByZone(zone));
    }

    /** GET /slots/type/{type} — slots by type */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Slot>> getSlotsByType(@PathVariable String type) {
        return ResponseEntity.ok(slotService.getSlotsByType(type));
    }

    /** GET /slots/available — count of free slots (system-wide) */
    @GetMapping("/available")
    public ResponseEntity<Long> getAvailableSlots() {
        return ResponseEntity.ok(slotService.getAvailableSlots());
    }

    /** GET /slots/occupied — count of occupied slots (system-wide) */
    @GetMapping("/occupied")
    public ResponseEntity<Long> getOccupiedSlots() {
        return ResponseEntity.ok(slotService.getOccupiedSlots());
    }
}
