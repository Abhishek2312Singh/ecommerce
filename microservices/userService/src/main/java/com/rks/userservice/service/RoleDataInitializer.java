package com.rks.userservice.service;

import com.rks.userservice.entity.Role;
import com.rks.userservice.enums.Roles;
import com.rks.userservice.repository.RoleRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class RoleDataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepo roleRepository;

    @Override
    public void run(String... args) {

        for (Roles role : Roles.values()) {

            if (!roleRepository.existsByRole(role)) {
                roleRepository.save(new Role(role));
            }

        }

        System.out.println("Roles initialized successfully.");
    }
}