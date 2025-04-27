package com.nmdecor.staff_tracker.service;

import org.springframework.stereotype.Service;

import com.nmdecor.staff_tracker.config.AppProperties;
import com.nmdecor.staff_tracker.dto.JwtAuthResponse;
import com.nmdecor.staff_tracker.security.JwtTokenProvider;

@Service
public class AuthService {

    private final AppProperties appProperties;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AppProperties appProperties, JwtTokenProvider tokenProvider) {
        this.appProperties = appProperties;
        this.tokenProvider = tokenProvider;
    }

    public JwtAuthResponse authenticate(String password) {
        if (password.equals(appProperties.getAuth().getAdminPassword())) {
            String token = tokenProvider.generateToken("ADMIN");
            return new JwtAuthResponse(true, "Authentication successful", token, "admin");
        }
        return new JwtAuthResponse(false, "Invalid password");
    }

    public JwtAuthResponse verifyToken(String token) {
        if (tokenProvider.validateToken(token)) {
            String role = tokenProvider.getRole(token);
            return new JwtAuthResponse(true, "Token is valid", token, role);
        }
        return new JwtAuthResponse(false, "Invalid or expired token");
    }
}
