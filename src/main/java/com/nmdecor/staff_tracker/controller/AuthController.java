package com.nmdecor.staff_tracker.controller;

import com.nmdecor.staff_tracker.dto.JwtAuthResponse;
import com.nmdecor.staff_tracker.dto.LoginRequest;
import com.nmdecor.staff_tracker.dto.TokenVerificationRequest;
import com.nmdecor.staff_tracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.authenticate(loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<JwtAuthResponse> verifyToken(@Valid @RequestBody TokenVerificationRequest request) {
        JwtAuthResponse response = authService.verifyToken(request.getToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<JwtAuthResponse> logout() {
        // JWT is stateless, so we don't need to do anything server-side for logout
        // The client should remove the token from storage
        return ResponseEntity.ok(new JwtAuthResponse(true, "Logged out successfully"));
    }
}
