package com.rks.userservice.service;

import com.rks.userservice.dto.responseDto.UserResponse;
import com.rks.userservice.repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private UserRepo userRepo;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepo.findByEmail(username).orElseThrow(()->new RuntimeException("User not found!"));
    }
    public UserResponse getUser(String email){
        UserResponse response = modelMapper.map(userRepo.findByEmail(email),UserResponse.class);
        return response;
    }
}
