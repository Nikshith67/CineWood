package com.cinewood.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

public class AuthDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class SignupRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 255, message = "Email must not exceed 255 characters")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?`~]).*$",
            message = "Password must contain at least one number and one special character"
        )
        private String password;

        @Size(max = 50, message = "Profile name must not exceed 50 characters")
        private String profileName;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class SigninRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 255, message = "Email must not exceed 255 characters")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(max = 72, message = "Password must not exceed 72 characters")
        private String password;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String email;
        private Long userId;
        private String role;
        private String subscriptionTier;
        private String message;
    }
}
