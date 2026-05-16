package com.smartparkhub.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration.
 *  - Stateless JWT sessions
 *  - CORS: frontend on localhost:5173
 *  - Public:  POST /login, GET /admin/seed, GET /campuses
 *  - Everything else requires a valid Bearer JWT
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — stateless REST API with JWT
            .csrf(AbstractHttpConfigurer::disable)

            // CORS — handled by corsConfigurationSource()
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless — no HTTP session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no token required)
                .requestMatchers(HttpMethod.POST, "/login").permitAll()
                .requestMatchers(HttpMethod.GET,  "/admin/seed").permitAll()
                .requestMatchers(HttpMethod.GET,  "/admin/create-superadmin").permitAll()
                .requestMatchers(HttpMethod.GET,  "/campuses").permitAll()
                .requestMatchers(HttpMethod.GET,  "/campuses/**").permitAll()

                // Super-admin only routes
                .requestMatchers("/superadmin/**").hasRole("SUPER_ADMIN")

                // Admin + Super-admin routes
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Authenticated users — change password, view profile
                .requestMatchers("/users/**").authenticated()

                // Slot and parking data — authenticated users
                .requestMatchers("/slots/**").authenticated()
                .requestMatchers("/parking/**").authenticated()
                .requestMatchers("/visitor-passes/**").authenticated()

                // Fallback — require authentication
                .anyRequest().authenticated()
            )

            // JWT filter runs before Spring's username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow frontend origins
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
