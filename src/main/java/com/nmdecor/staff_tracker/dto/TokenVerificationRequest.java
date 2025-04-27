package com.nmdecor.staff_tracker.dto;

import jakarta.validation.constraints.NotBlank;

public class TokenVerificationRequest {
    @NotBlank(message = "Token is required")
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
