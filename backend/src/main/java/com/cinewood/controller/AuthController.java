package com.cinewood.controller;

import com.cinewood.dto.AuthDto;
import com.cinewood.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthDto.AuthResponse> signup(@Valid @RequestBody AuthDto.SignupRequest request) {
        try {
            AuthDto.AuthResponse response = authService.signup(request);
            if (response.getToken() == null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthDto.AuthResponse.builder()
                            .message("Account creation failed: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthDto.AuthResponse> signin(@Valid @RequestBody AuthDto.SigninRequest request) {
        try {
            AuthDto.AuthResponse response = authService.signin(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthDto.AuthResponse.builder().message("Invalid email or password").build());
        }
    }
}
