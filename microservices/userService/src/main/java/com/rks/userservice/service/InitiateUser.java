package com.rks.userservice.service;

import com.rks.userservice.config.SecurityConfig;
import com.rks.userservice.entity.Role;
import com.rks.userservice.entity.User;
import com.rks.userservice.enums.Roles;
import com.rks.userservice.repository.RoleRepo;
import com.rks.userservice.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class InitiateUser {
    @Autowired
    private SecurityConfig config;
    @Autowired
    private UserRepo userRepo;
    @Bean
    public CommandLineRunner createUserAdmin(RoleRepo roleRepo){
        return args -> {
            if(userRepo.findByEmail("abhishek@gmail.com").isEmpty()){
                User user = new User();
                user.setAddress("Noida");
                user.setEmail("abhishek@gmail.com");
                user.setFullName("Abhishek Singh");
                user.setPassword(config.encoder().encode("admin"));
                user.setMobile("7701933308");
                user.setRole(roleRepo.findByRoles(Roles.ROLE_ADMIN).orElseThrow(()-> new RuntimeException("Role Not Found")));
                userRepo.save(user);
                System.out.println("User Created");
            }
        };
    }
}
