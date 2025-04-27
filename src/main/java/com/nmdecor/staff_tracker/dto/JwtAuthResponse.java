package com.nmdecor.staff_tracker.dto;

public class JwtAuthResponse {
    private boolean success;
    private String message;
    private String token;
    private String role;

    public JwtAuthResponse() {
    }

    public JwtAuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public JwtAuthResponse(boolean success, String message, String token, String role) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.role = role;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
