package com.smartparkhub.backend.controller;

import com.smartparkhub.backend.dto.CampusDto;
import com.smartparkhub.backend.entity.Campus;
import com.smartparkhub.backend.repository.CampusRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class CampusController {

    @Autowired
    private CampusRepo campusRepo;

    /** GET /campuses — all campuses (readable by any role for dropdowns) */
    @GetMapping("/campuses")
    public List<Campus> getAllCampuses() {
        return campusRepo.findAll();
    }

    /** GET /campuses/{id} */
    @GetMapping("/campuses/{id}")
    public ResponseEntity<Campus> getCampus(@PathVariable Long id) {
        return campusRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /superadmin/campuses — create campus (Super Admin only) */
    @PostMapping("/superadmin/campuses")
    public ResponseEntity<Campus> createCampus(@RequestBody CampusDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Campus campus = new Campus();
        campus.setName(dto.getName());
        campus.setLocation(dto.getLocation());
        campus.setTotalSlots(dto.getTotalSlots() != null ? dto.getTotalSlots() : 0);
        // auto-derive campusKey from name if not supplied
        String key = dto.getCampusKey() != null && !dto.getCampusKey().isBlank()
                ? dto.getCampusKey().toLowerCase().replaceAll("\\s+", "-")
                : dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        campus.setCampusKey(key);
        campusRepo.save(campus);
        return ResponseEntity.ok(campus);
    }

    /** PUT /superadmin/campuses/{id} — edit campus */
    @PutMapping("/superadmin/campuses/{id}")
    public ResponseEntity<Campus> updateCampus(@PathVariable Long id, @RequestBody CampusDto dto) {
        Optional<Campus> opt = campusRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Campus campus = opt.get();
        if (dto.getName() != null && !dto.getName().isBlank()) campus.setName(dto.getName());
        if (dto.getLocation() != null) campus.setLocation(dto.getLocation());
        if (dto.getTotalSlots() != null) campus.setTotalSlots(dto.getTotalSlots());
        if (dto.getCampusKey() != null && !dto.getCampusKey().isBlank()) campus.setCampusKey(dto.getCampusKey());
        campusRepo.save(campus);
        return ResponseEntity.ok(campus);
    }

    /** DELETE /superadmin/campuses/{id} — remove campus */
    @DeleteMapping("/superadmin/campuses/{id}")
    public ResponseEntity<Void> deleteCampus(@PathVariable Long id) {
        if (!campusRepo.existsById(id)) return ResponseEntity.notFound().build();
        campusRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
