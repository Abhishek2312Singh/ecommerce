package com.smartparkhub.backend.service;

import com.smartparkhub.backend.dto.ChangePasswordDto;
import com.smartparkhub.backend.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import com.smartparkhub.backend.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    public void changePassword(
            Long id,
            ChangePasswordDto dto,
            Authentication auth) {

        User user = userRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a ->
                        a.getAuthority().contains("ADMIN")
                                || a.getAuthority().contains("SUPER_ADMIN"));

        if (!isAdmin && !user.getEmail().equals(auth.getName())) {
            throw new RuntimeException("Access denied");
        }

        if (!user.getPassword().equals(dto.getOldPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (dto.getNewPassword() == null
                || dto.getNewPassword().isBlank()) {

            throw new RuntimeException(
                    "New password cannot be empty");
        }

        user.setPassword(dto.getNewPassword());

        userRepo.save(user);
    }

    public Map<String, Object> getUser(Long id) {

        User user = userRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return toSafeMap(user);
    }

    public Map<String, Object> toSafeMap(User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",            user.getId());
        m.put("name",          user.getName());
        m.put("fatherName",    user.getFatherName());
        m.put("email",         user.getEmail());
        m.put("mobileNo",      user.getMobileNo());
        m.put("role",          user.getRole() != null ? user.getRole().name() : null);
        m.put("campus",        user.getCampus());
        m.put("batch",         user.getBatch());
        m.put("collegeId",     user.getCollegeId());
        m.put("license",       user.getLicense());
        m.put("vehicle",       user.getVehicle());
        m.put("vehicleType",   user.getVehicleType() != null ? user.getVehicleType().name() : null);
        m.put("vehicleName",   user.getVehicleName());
        m.put("vehicleColor",  user.getVehicleColor());
        m.put("vehicleModel",  user.getVehicleModel());
        m.put("vehicleImage",  user.getVehicleImage());
        m.put("isParked",      Boolean.TRUE.equals(user.getIsParked()));
        // password intentionally omitted
        return m;
    }
}
