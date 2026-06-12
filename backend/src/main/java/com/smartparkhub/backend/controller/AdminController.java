package com.smartparkhub.backend.controller;

import com.smartparkhub.backend.dto.CreateUserRequestDto;
import com.smartparkhub.backend.dto.PasswordResetDto;
import com.smartparkhub.backend.dto.UpdateUserRequestDto;
import com.smartparkhub.backend.entity.User;
import com.smartparkhub.backend.enums.Role;
import com.smartparkhub.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class AdminController {

    @Autowired
    private UserRepo userRepo;

    /** POST /admin/create-user — create any campus user (STUDENT, FACULTY, STAFF, ADMIN) */
    @PostMapping("/admin/create-user")
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequestDto dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setFatherName(dto.getFatherName());
        user.setEmail(dto.getEmail());
        user.setMobileNo(dto.getMobileNo());
        user.setRole(dto.getRole() != null ? dto.getRole() : Role.STUDENT);
        user.setCampus(dto.getCampus());
        user.setBatch(dto.getBatch());
        user.setCollegeId(dto.getCollegeId());
        user.setLicense(dto.getLicense());
        user.setVehicle(dto.getVehicle());
        user.setPassword(dto.getPassword());
        user.setVehicleType(dto.getVehicleType());
        user.setVehicleName(dto.getVehicleName());
        user.setVehicleColor(dto.getVehicleColor());
        user.setVehicleModel(dto.getVehicleModel());
        user.setVehicleImage(dto.getVehicleImage());
        userRepo.save(user);
        return ResponseEntity.ok(user);
    }

    /**
     * GET /admin/allUsers — list users scoped by the caller's role:
     *   - SUPER_ADMIN → all users
     *   - ADMIN        → only users from their campus (from JWT)
     */
    @GetMapping("/admin/allUsers")
    public List<User> getAllUsers(Authentication auth) {
        boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (isSuperAdmin) {
            return userRepo.findAll();
        }
        // Extract campus from the JWT (stored as credentials in JwtAuthFilter)
        String campus = auth != null ? (String) auth.getCredentials() : null;
        if (campus != null && !campus.isBlank()) {
            return userRepo.findByCampus(campus);
        }
        return userRepo.findAll();
    }

    /** GET /admin/users/campus/{campusKey} — list users for a specific campus */
    @GetMapping("/admin/users/campus/{campusKey}")
    public List<User> getUsersByCampus(@PathVariable String campusKey) {
        return userRepo.findByCampus(campusKey);
    }

    /** PUT /admin/users/{id} — update user details */
    @PutMapping("/admin/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequestDto dto) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        User user = opt.get();
        if (dto.getName()         != null) user.setName(dto.getName());
        if (dto.getFatherName()   != null) user.setFatherName(dto.getFatherName());
        if (dto.getEmail()        != null) user.setEmail(dto.getEmail());
        if (dto.getMobileNo()     != null) user.setMobileNo(dto.getMobileNo());
        if (dto.getRole()         != null) user.setRole(dto.getRole());
        if (dto.getCampus()       != null) user.setCampus(dto.getCampus());
        if (dto.getBatch()        != null) user.setBatch(dto.getBatch());
        if (dto.getCollegeId()    != null) user.setCollegeId(dto.getCollegeId());
        if (dto.getLicense()      != null) user.setLicense(dto.getLicense());
        if (dto.getVehicle()      != null) user.setVehicle(dto.getVehicle());
        if (dto.getVehicleType()  != null) user.setVehicleType(dto.getVehicleType());
        if (dto.getVehicleName()  != null) user.setVehicleName(dto.getVehicleName());
        if (dto.getVehicleColor() != null) user.setVehicleColor(dto.getVehicleColor());
        if (dto.getVehicleModel() != null) user.setVehicleModel(dto.getVehicleModel());
        if (dto.getVehicleImage() != null) user.setVehicleImage(dto.getVehicleImage());
        userRepo.save(user);
        return ResponseEntity.ok(user);
    }

    /** DELETE /admin/users/{id} — permanently delete a user */
    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepo.existsById(id)) return ResponseEntity.notFound().build();
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** PUT /admin/users/{id}/reset-password — admin resets a user's password */
    @PutMapping("/admin/users/{id}/reset-password")
    public ResponseEntity<String> resetUserPassword(@PathVariable Long id, @RequestBody PasswordResetDto dto) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        if (dto.getNewPassword() == null || dto.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body("newPassword is required");
        }
        User user = opt.get();
        user.setPassword(dto.getNewPassword());
        userRepo.save(user);
        return ResponseEntity.ok("Password reset successfully");
    }

    /**
     * GET /admin/seed — one-time endpoint to create default accounts.
     * Call: http://localhost:8080/admin/seed
     * Remove or secure this before production!
     */
    @GetMapping("/admin/seed")
    public String seedDefaults() {
        StringBuilder result = new StringBuilder("Seed result:\n");

        // Upsert Super Admin
        result.append(upsertUser("Super Admin", "superadmin@smartparkhub.com",
                "SuperAdmin@123", Role.SUPER_ADMIN, "main", null, "SA-0001", null, null));

        // Upsert Campus Admin
        result.append(upsertUser("Main Campus Admin", "admin@smartparkhub.com",
                "Admin@123", Role.ADMIN, "main", null, "ADMIN-0001", null, null));

        // Upsert Demo Student
        result.append(upsertUser("Demo Student", "student@smartparkhub.com",
                "Student@123", Role.STUDENT, "main", "BCA 2023-26", "23BCA1001", "DL-STU-001", "UP14 AB 1234"));

        // Upsert Demo Faculty
        result.append(upsertUser("Demo Faculty", "faculty@smartparkhub.com",
                "Faculty@123", Role.FACULTY, "main", null, "FAC-0001", "DL-FAC-001", "UP14 CD 5678"));

        // Upsert Demo Staff
        result.append(upsertUser("Demo Staff", "staff@smartparkhub.com",
                "Staff@123", Role.STAFF, "main", null, "STF-0001", "DL-STF-001", "UP14 EF 9012"));

        return result.toString();
    }

    /**
     * GET /admin/create-superadmin
     * Force-creates (or resets) the super admin account.
     * Use this if the super admin is missing or locked out.
     * Call: http://localhost:8080/admin/create-superadmin
     */
    @GetMapping("/admin/create-superadmin")
    public String createSuperAdmin() {
        String msg = upsertUser("Super Admin", "superadmin@smartparkhub.com",
                "SuperAdmin@123", Role.SUPER_ADMIN, "main", null, "SA-0001", null, null);
        return "Super Admin account ready:\n" +
               "  Email    : superadmin@smartparkhub.com\n" +
               "  Password : SuperAdmin@123\n" +
               "  Login at : http://localhost:5173/superadmin/login\n\n" + msg;
    }

    /** Upsert a user by email — creates if not found, updates if found. */
    private String upsertUser(String name, String email, String password, Role role,
                              String campus, String batch, String collegeId,
                              String license, String vehicle) {
        Optional<User> existing = userRepo.findByEmail(email);
        User user = existing.orElse(new User());
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        user.setCampus(campus);
        user.setBatch(batch);
        user.setCollegeId(collegeId);
        user.setLicense(license);
        user.setVehicle(vehicle);
        userRepo.save(user);
        return (existing.isPresent() ? "  Updated: " : "  Created: ") + role + " → " + email + "\n";
    }
}
