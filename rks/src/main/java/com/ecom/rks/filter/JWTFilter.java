package com.ecom.rks.filter;

import com.ecom.rks.repository.UserRepo;
import com.ecom.rks.utils.JWTUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.List;

@Component
public class JWTFilter extends OncePerRequestFilter {
    @Autowired
    private JWTUtil jwtUtil;
    @Autowired
    private UserRepo userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = null;
        String email = null;
        if(header != null && header.startsWith("Bearer ")){
            token = header.substring(7);
            if(token != null){
                Claims claims = jwtUtil.getClaims(token);
                email = claims.getSubject();
                if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
                    if(claims.getExpiration().after(new Date()) && email.equals(userDetails.getUsername())){
                        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails,null, List.of());
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    }
                }
            }
        }
        filterChain.doFilter(request,response);
    }
}
