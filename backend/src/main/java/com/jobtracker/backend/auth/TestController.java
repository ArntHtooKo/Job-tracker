package com.jobtracker.backend.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class TestController {

    @GetMapping("/profile")
    public ResponseEntity<String> getProfile() {
        // Get the email of the user who sent the token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok("Hello! You are securely logged in as: " + email);
    }
}